// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';
import { MONTH_NAME_TO_NUMBER, MONTH_NAMES } from '../common/constants';
import { addMonths, toMonthStart } from '../common/date-utils';
import { roundCurrency, toNumber } from '../common/money';

const CategoryType = {
  FIXED: 'FIXED',
  VARIABLE: 'VARIABLE',
} as const;

const CustomIncomeKind = {
  FIXED_EXTRA: 'FIXED_EXTRA',
  VARIABLE_EXTRA: 'VARIABLE_EXTRA',
  OTHER: 'OTHER',
} as const;

const FixedExpenseStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
} as const;

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async seedIfNeeded(): Promise<void> {
    const hasSettings = await this.prisma.appSettings.count();
    if (hasSettings > 0) {
      return;
    }

    const workbookPath = process.env.WORKBOOK_PATH ?? 'private-file/Controle_Financeiro_Corrigido(1).xlsx';
    const workbook = XLSX.readFile(workbookPath, { cellDates: false });

    const configSheet = workbook.Sheets.Config;
    const contasSheet = workbook.Sheets.Contas;
    if (!configSheet || !contasSheet) {
      throw new Error('A planilha não contém as abas esperadas.');
    }

    const referenceYear = Number(this.cell(configSheet, 'B3'));
    const currentMonthReference = this.excelDate(this.cell(configSheet, 'B4'));
    const controlStartDate = this.excelDate(this.cell(configSheet, 'B5'));

    const settingsData = {
      id: 1,
      referenceYear,
      currentMonthReference,
      controlStartDate,
      salaryNetTotal: toNumber(this.cell(configSheet, 'E4')),
      salaryFirstInstallment: toNumber(this.cell(configSheet, 'E5')),
      salarySecondInstallment: toNumber(this.cell(configSheet, 'E6')),
      salaryFirstInstallmentDay: Number(this.cell(configSheet, 'E7')),
      salarySecondInstallmentLast: true,
      monthlyInvestmentContribution: toNumber(this.cell(configSheet, 'E9')),
      projectedMonthlyReturnRate: Number(this.cell(configSheet, 'E10') ?? 0),
      initialCheckingBalance: toNumber(this.cell(contasSheet, 'D3')),
      initialInvestmentBalance: toNumber(this.cell(contasSheet, 'F3')),
    };

    const parsed = this.parseWorkbook(workbook, referenceYear, settingsData.monthlyInvestmentContribution);

    await this.prisma.$transaction(async (tx) => {
      await tx.monthlyFixedExpenseStatus.deleteMany();
      await tx.variableExpense.deleteMany();
      await tx.monthlyIncome.deleteMany();
      await tx.monthlyAdjustment.deleteMany();
      await tx.installmentPlan.deleteMany();
      await tx.fixedExpenseTemplate.deleteMany();
      await tx.category.deleteMany();
      await tx.appSettings.deleteMany();

      await tx.appSettings.create({ data: settingsData });

      for (const category of parsed.categories) {
        await tx.category.upsert({
          where: { name: category.name },
          update: { type: category.type },
          create: category,
        });
      }

      for (const categoryName of parsed.extraCategoryNames) {
        await tx.category.upsert({
          where: { name: categoryName },
          update: {},
          create: { name: categoryName, type: CategoryType.VARIABLE },
        });
      }

      const categories = await tx.category.findMany();
      const categoryMap = new Map(categories.map((item) => [item.name, item.id]));

      const templateMap = new Map();
      for (const template of parsed.fixedExpenses) {
        const created = await tx.fixedExpenseTemplate.create({
          data: {
            description: template.description,
            categoryId: this.requireCategory(categoryMap, template.categoryName),
            defaultAmount: template.defaultAmount,
            dueDay: template.dueDay,
            dueOnLastDay: template.dueOnLastDay,
          },
        });
        templateMap.set(template.description, created.id);
      }

      for (const plan of parsed.installments) {
        await tx.installmentPlan.create({
          data: {
            description: plan.description,
            categoryId: this.requireCategory(categoryMap, plan.categoryName),
            totalAmount: plan.totalAmount,
            installmentCount: plan.installmentCount,
            monthlyAmount: plan.monthlyAmount,
            purchaseDate: plan.purchaseDate,
            firstInstallmentMonth: plan.firstInstallmentMonth,
            lastInstallmentMonth: plan.lastInstallmentMonth,
            paymentSource: plan.paymentSource,
          },
        });
      }

      for (const income of parsed.customIncomes) {
        await tx.monthlyIncome.create({ data: income });
      }

      for (const status of parsed.fixedStatuses) {
        const templateId = templateMap.get(status.description);
        if (!templateId) {
          continue;
        }

        await tx.monthlyFixedExpenseStatus.create({
          data: {
            year: status.year,
            month: status.month,
            fixedExpenseTemplateId: templateId,
            status: status.status,
            paidAmount: status.paidAmount,
          },
        });
      }

      for (const expense of parsed.variableExpenses) {
        await tx.variableExpense.create({
          data: {
            year: expense.year,
            month: expense.month,
            expenseDate: expense.expenseDate,
            description: expense.description,
            categoryId: this.requireCategory(categoryMap, expense.categoryName),
            amount: expense.amount,
          },
        });
      }

      for (const adjustment of parsed.adjustments) {
        await tx.monthlyAdjustment.create({ data: adjustment });
      }
    });

    this.logger.log('Base inicial importada da planilha.');
  }

  private parseWorkbook(workbook: XLSX.WorkBook, referenceYear: number, defaultContribution: number) {
    const categoriesSheet = workbook.Sheets.Categorias;
    const fixedSheet = workbook.Sheets.DespesasFixas;
    const installmentSheet = workbook.Sheets.Parcelamentos;
    const contasSheet = workbook.Sheets.Contas;

    const categories = [];
    const extraCategoryNames = new Set<string>();
    const fixedExpenses = [];
    const installments = [];
    const customIncomes = [];
    const fixedStatuses = [];
    const variableExpenses = [];
    const adjustments = [];

    for (let row = 3; row <= 60; row += 1) {
      const name = this.cleanString(this.cell(categoriesSheet, `A${row}`));
      const type = this.cleanString(this.cell(categoriesSheet, `B${row}`));
      if (!name) {
        continue;
      }

      categories.push({
        name,
        type: type === 'Fixa' ? CategoryType.FIXED : CategoryType.VARIABLE,
      });
    }

    for (let row = 5; row <= 40; row += 1) {
      const description = this.cleanString(this.cell(fixedSheet, `A${row}`));
      const categoryName = this.cleanString(this.cell(fixedSheet, `B${row}`));
      const defaultAmount = toNumber(this.cell(fixedSheet, `C${row}`));
      const dueRaw = this.cell(fixedSheet, `D${row}`);

      if (!description || !categoryName || !defaultAmount) {
        continue;
      }

      fixedExpenses.push({
        description,
        categoryName,
        defaultAmount,
        dueDay: typeof dueRaw === 'number' ? dueRaw : null,
        dueOnLastDay: typeof dueRaw === 'string' && dueRaw.toLowerCase().includes('último'),
      });
    }

    for (let row = 5; row <= 50; row += 1) {
      const description = this.cleanString(this.cell(installmentSheet, `B${row}`));
      const categoryName = this.cleanString(this.cell(installmentSheet, `C${row}`));
      const totalAmount = toNumber(this.cell(installmentSheet, `D${row}`));
      const installmentCount = Number(this.cell(installmentSheet, `E${row}`) ?? 0);
      if (!description || !categoryName || !totalAmount || !installmentCount) {
        continue;
      }

      extraCategoryNames.add(categoryName);
      const purchaseDate = this.excelDate(this.cell(installmentSheet, `G${row}`));
      const firstInstallmentMonth = this.excelDate(this.cell(installmentSheet, `H${row}`), true);
      const lastInstallmentMonthRaw = this.cell(installmentSheet, `I${row}`);
      const lastInstallmentMonth =
        lastInstallmentMonthRaw !== undefined && lastInstallmentMonthRaw !== null
          ? this.excelDate(lastInstallmentMonthRaw, true)
          : addMonths(firstInstallmentMonth, installmentCount - 1);

      installments.push({
        description,
        categoryName,
        totalAmount,
        installmentCount,
        monthlyAmount: roundCurrency(toNumber(this.cell(installmentSheet, `F${row}`)) || totalAmount / installmentCount),
        purchaseDate,
        firstInstallmentMonth,
        lastInstallmentMonth,
        paymentSource: this.cleanString(this.cell(installmentSheet, `J${row}`)) || 'Não informado',
      });
    }

    for (const monthName of MONTH_NAMES) {
      const sheet = workbook.Sheets[monthName];
      if (!sheet) {
        continue;
      }

      const month = MONTH_NAME_TO_NUMBER[monthName.toLowerCase()];
      for (let offset = 0; offset < 4; offset += 1) {
        const row = 7 + offset;
        const description = this.cleanString(this.cell(sheet, `A${row}`));
        const amount = toNumber(this.cell(sheet, `C${row}`));
        if (!description || !amount) {
          continue;
        }

        customIncomes.push({
          year: referenceYear,
          month,
          description,
          day: typeof this.cell(sheet, `B${row}`) === 'number' ? Number(this.cell(sheet, `B${row}`)) : undefined,
          amount,
          kind: offset === 0 ? CustomIncomeKind.FIXED_EXTRA : offset === 1 ? CustomIncomeKind.VARIABLE_EXTRA : CustomIncomeKind.OTHER,
          sortOrder: offset,
        });
      }

      for (let row = 15; row <= 28; row += 1) {
        const description = this.cleanString(this.cell(sheet, `A${row}`));
        if (!description) {
          continue;
        }

        fixedStatuses.push({
          year: referenceYear,
          month,
          description,
          status: this.cleanString(this.cell(sheet, `D${row}`)) === 'Pago' ? FixedExpenseStatus.PAID : FixedExpenseStatus.PENDING,
          paidAmount: toNumber(this.cell(sheet, `E${row}`)),
        });
      }

      for (let row = 5; row <= 34; row += 1) {
        const description = this.cleanString(this.cell(sheet, `J${row}`));
        const categoryName = this.cleanString(this.cell(sheet, `K${row}`));
        const amount = toNumber(this.cell(sheet, `L${row}`));
        if (!description || !amount) {
          continue;
        }

        if (categoryName) {
          extraCategoryNames.add(categoryName);
        }

        const dateValue = this.cell(sheet, `I${row}`);
        const expenseDate = typeof dateValue === 'number' ? this.excelDate(dateValue) : toMonthStart(referenceYear, month);

        variableExpenses.push({
          year: referenceYear,
          month,
          expenseDate,
          description,
          categoryName: categoryName || 'Sem categoria',
          amount,
        });
      }
    }

    for (let month = 1; month <= 12; month += 1) {
      const row = month + 5;
      const contributionValue = this.cell(contasSheet, `F${row}`);
      const returnAdjustmentValue = this.cell(contasSheet, `H${row}`);
      const contributionNumber = typeof contributionValue === 'number' ? roundCurrency(contributionValue) : null;
      const returnAdjustmentNumber = typeof returnAdjustmentValue === 'number' ? roundCurrency(returnAdjustmentValue) : null;

      if (contributionNumber === null && returnAdjustmentNumber === null) {
        continue;
      }

      adjustments.push({
        year: referenceYear,
        month,
        investmentContributionOverride:
          contributionNumber !== null && contributionNumber !== defaultContribution ? contributionNumber : null,
        investmentReturnAdjustment: returnAdjustmentNumber,
      });
    }

    extraCategoryNames.add('Sem categoria');

    return {
      categories,
      extraCategoryNames,
      fixedExpenses,
      installments,
      customIncomes,
      fixedStatuses,
      variableExpenses,
      adjustments,
    };
  }

  private requireCategory(categoryMap: Map<string, string>, name: string): string {
    const categoryId = categoryMap.get(name);
    if (!categoryId) {
      throw new Error(`Categoria não encontrada durante a importação: ${name}`);
    }

    return categoryId;
  }

  private cell(sheet, address: string) {
    return sheet?.[address]?.v;
  }

  private cleanString(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private excelDate(value: unknown, normalizeToMonthStart = false): Date {
    if (value instanceof Date) {
      return normalizeToMonthStart ? toMonthStart(value.getUTCFullYear(), value.getUTCMonth() + 1) : value;
    }

    if (typeof value !== 'number') {
      throw new Error(`Valor de data inválido na planilha: ${value}`);
    }

    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) {
      throw new Error(`Não foi possível converter a data do Excel: ${value}`);
    }

    return normalizeToMonthStart ? toMonthStart(parsed.y, parsed.m) : new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
  }
}