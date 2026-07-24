// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { formatMonthLabel, monthDiff, normalizeMonthDate, toMonthStart } from '../common/date-utils';
import { roundCurrency, toNumber } from '../common/money';
import { MONTH_NAMES } from '../common/constants';

const FixedExpenseStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
} as const;

@Injectable()
export class MonthsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configurationService: ConfigurationService,
  ) {}

  async getMonth(year: number, month: number) {
    const settings = await this.configurationService.getSettings();
    const accounts = await this.getAccountsOverview(year);
    const monthData = await this.buildMonthDetails(year, month, settings);
    const accountRow = accounts.find((item) => item.month === month);

    return {
      ...monthData,
      checkingBalance: accountRow?.checkingBalance ?? null,
      investmentBalance: accountRow?.investmentBalance ?? null,
      investmentReturnAdjustment: accountRow?.investmentReturnAdjustment ?? 0,
      netWorth: accountRow?.netWorth ?? null,
    };
  }

  async getAccountsOverview(year: number) {
    const context = await this.getYearContext(year);
    const startMonth = normalizeMonthDate(context.settings.controlStartDate);
    const rows = [];
    let previousChecking = 0;
    let previousInvestment = 0;
    let hasStarted = false;

    for (let month = 1; month <= 12; month += 1) {
      const summary = this.composeMonthSummary(year, month, context);
      const monthDate = toMonthStart(year, month);

      if (monthDate < startMonth) {
        rows.push({
          month,
          label: MONTH_NAMES[month - 1],
          entriesTotal: 0,
          fixedPlannedTotal: 0,
          fixedPaidTotal: 0,
          variableTotal: 0,
          installmentTotal: 0,
          investmentContribution: 0,
          sheetInvestmentContribution: 0,
          checkingBalance: null,
          investmentReturnAdjustment: 0,
          investmentBalance: null,
          netWorth: null,
        });
        continue;
      }

      const contribution = summary.effectiveInvestmentContribution;
      const investmentReturnAdjustment = summary.adjustment?.investmentReturnAdjustment ?? 0;
      const checkingBalance = roundCurrency(
        (hasStarted ? previousChecking : toNumber(context.settings.initialCheckingBalance)) +
          summary.entriesTotal -
          summary.fixedPlannedTotal -
          summary.variableTotal -
          summary.installmentTotal -
          contribution,
      );
      const investmentBalance = roundCurrency(
        (hasStarted ? previousInvestment : toNumber(context.settings.initialInvestmentBalance)) +
          contribution +
          investmentReturnAdjustment,
      );
      const netWorth = roundCurrency(checkingBalance + investmentBalance);

      hasStarted = true;
      previousChecking = checkingBalance;
      previousInvestment = investmentBalance;

      rows.push({
        month,
        label: MONTH_NAMES[month - 1],
        entriesTotal: summary.entriesTotal,
        fixedPlannedTotal: summary.fixedPlannedTotal,
        fixedPaidTotal: summary.fixedPaidTotal,
        variableTotal: summary.variableTotal,
        installmentTotal: summary.installmentTotal,
        investmentContribution: contribution,
        sheetInvestmentContribution: summary.investmentContribution,
        checkingBalance,
        investmentReturnAdjustment,
        investmentBalance,
        netWorth,
      });
    }

    return rows;
  }

  async createIncome(year: number, month: number, dto) {
    return this.prisma.monthlyIncome.create({
      data: {
        year,
        month,
        description: dto.description,
        day: dto.day,
        amount: dto.amount,
        kind: dto.kind,
      },
    });
  }

  async createVariableExpense(year: number, month: number, dto) {
    return this.prisma.variableExpense.create({
      data: {
        year,
        month,
        expenseDate: new Date(dto.expenseDate),
        description: dto.description,
        categoryId: dto.categoryId,
        amount: dto.amount,
      },
    });
  }

  async updateFixedExpenseStatus(year: number, month: number, templateId: string, dto) {
    const template = await this.prisma.fixedExpenseTemplate.findUniqueOrThrow({
      where: { id: templateId },
    });

    const paidAmount =
      dto.status === FixedExpenseStatus.PAID
        ? roundCurrency(dto.paidAmount ?? toNumber(template.defaultAmount))
        : 0;

    return this.prisma.monthlyFixedExpenseStatus.upsert({
      where: {
        year_month_fixedExpenseTemplateId: {
          year,
          month,
          fixedExpenseTemplateId: templateId,
        },
      },
      update: {
        status: dto.status,
        paidAmount,
      },
      create: {
        year,
        month,
        fixedExpenseTemplateId: templateId,
        status: dto.status,
        paidAmount,
      },
    });
  }

  async updateAdjustment(year: number, month: number, dto) {
    const payload: any = {};
    if (dto.investmentContributionOverride !== undefined) {
      payload.investmentContributionOverride = dto.investmentContributionOverride;
    }
    if (dto.investmentReturnAdjustment !== undefined) {
      payload.investmentReturnAdjustment = dto.investmentReturnAdjustment;
    }

    return this.prisma.monthlyAdjustment.upsert({
      where: {
        year_month: { year, month },
      },
      update: payload,
      create: {
        year,
        month,
        investmentContributionOverride: dto.investmentContributionOverride ?? null,
        investmentReturnAdjustment: dto.investmentReturnAdjustment ?? null,
      },
    });
  }

  async buildMonthDetails(year: number, month: number, settings?) {
    const context = await this.getYearContext(year, settings);
    return this.composeMonthSummary(year, month, context);
  }

  private async getYearContext(year: number, providedSettings?) {
    const settings = providedSettings ?? (await this.configurationService.getSettings());
    const [templates, incomes, statuses, variableExpenses, installments, adjustments] =
      await Promise.all([
        this.prisma.fixedExpenseTemplate.findMany({
          include: { category: true },
          orderBy: { createdAt: 'asc' },
        }),
        this.prisma.monthlyIncome.findMany({
          where: { year },
          orderBy: [{ month: 'asc' }, { sortOrder: 'asc' }, { day: 'asc' }],
        }),
        this.prisma.monthlyFixedExpenseStatus.findMany({
          where: { year },
          include: { fixedExpenseTemplate: { include: { category: true } } },
        }),
        this.prisma.variableExpense.findMany({
          where: { year },
          include: { category: true },
          orderBy: [{ expenseDate: 'asc' }, { createdAt: 'asc' }],
        }),
        this.prisma.installmentPlan.findMany({ include: { category: true } }),
        this.prisma.monthlyAdjustment.findMany({ where: { year } }),
      ]);

    return { settings, templates, incomes, statuses, variableExpenses, installments, adjustments };
  }

  private composeMonthSummary(year: number, month: number, context) {
    const monthDate = toMonthStart(year, month);
    const startMonth = normalizeMonthDate(context.settings.controlStartDate);
    const isActive = monthDate >= startMonth;
    const statusMap = new Map(
      context.statuses
        .filter((item) => item.month === month)
        .map((item) => [item.fixedExpenseTemplateId, item]),
    );
    const adjustment = context.adjustments.find((item) => item.month === month) ?? null;
    const sheetContribution = isActive
      ? roundCurrency(toNumber(context.settings.monthlyInvestmentContribution))
      : 0;
    const effectiveContribution = isActive
      ? roundCurrency(
          adjustment?.investmentContributionOverride !== null &&
            adjustment?.investmentContributionOverride !== undefined
            ? toNumber(adjustment.investmentContributionOverride)
            : sheetContribution,
        )
      : 0;

    const incomes = isActive
      ? [
          {
            type: 'salary',
            description: 'Salário - 1ª parcela',
            day: context.settings.salaryFirstInstallmentDay,
            amount: toNumber(context.settings.salaryFirstInstallment),
          },
          {
            type: 'salary',
            description: 'Salário - 2ª parcela',
            day: 'Último dia do mês',
            amount: toNumber(context.settings.salarySecondInstallment),
          },
          ...context.incomes
            .filter((item) => item.month === month)
            .map((item) => ({
              id: item.id,
              type: 'custom',
              description: item.description,
              day: item.day,
              amount: toNumber(item.amount),
              kind: item.kind,
            })),
        ]
      : [];

    const fixedExpenses = context.templates.map((template) => {
      const status = statusMap.get(template.id);
      const paidAmount = isActive ? toNumber(status?.paidAmount) : 0;
      const currentStatus = status?.status ?? FixedExpenseStatus.PENDING;

      return {
        id: template.id,
        description: template.description,
        categoryId: template.categoryId,
        categoryName: template.category.name,
        plannedAmount: isActive ? toNumber(template.defaultAmount) : 0,
        paidAmount,
        dueDay: template.dueOnLastDay ? 'Último dia do mês' : template.dueDay,
        status: currentStatus,
      };
    });

    const variableExpenses = isActive
      ? context.variableExpenses
          .filter((item) => item.month === month)
          .map((item) => ({
            id: item.id,
            description: item.description,
            amount: toNumber(item.amount),
            expenseDate: item.expenseDate,
            categoryId: item.categoryId,
            categoryName: item.category.name,
          }))
      : [];

    const activeInstallments = isActive
      ? context.installments
          .filter(
            (item) =>
              item.firstInstallmentMonth <= monthDate && item.lastInstallmentMonth >= monthDate,
          )
          .map((item) => ({
            id: item.id,
            description: item.description,
            categoryName: item.category.name,
            installmentAmount: toNumber(item.monthlyAmount),
            installmentCount: item.installmentCount,
            installmentNumber: monthDiff(item.firstInstallmentMonth, monthDate) + 1,
            paymentSource: item.paymentSource,
          }))
      : [];

    const entriesTotal = roundCurrency(incomes.reduce((sum, item) => sum + toNumber(item.amount), 0));
    const fixedPlannedTotal = roundCurrency(
      fixedExpenses.reduce((sum, item) => sum + toNumber(item.plannedAmount), 0),
    );
    const fixedPaidTotal = roundCurrency(
      fixedExpenses.reduce((sum, item) => sum + toNumber(item.paidAmount), 0),
    );
    const variableTotal = roundCurrency(
      variableExpenses.reduce((sum, item) => sum + toNumber(item.amount), 0),
    );
    const installmentTotal = roundCurrency(
      activeInstallments.reduce((sum, item) => sum + toNumber(item.installmentAmount), 0),
    );
    const availableBalance = roundCurrency(
      entriesTotal - fixedPaidTotal - variableTotal - installmentTotal - sheetContribution,
    );

    return {
      year,
      month,
      label: formatMonthLabel(year, month),
      isActive,
      incomes,
      fixedExpenses,
      variableExpenses,
      activeInstallments,
      entriesTotal,
      fixedPlannedTotal,
      fixedPaidTotal,
      variableTotal,
      installmentTotal,
      investmentContribution: sheetContribution,
      effectiveInvestmentContribution: effectiveContribution,
      availableBalance,
      adjustment: adjustment
        ? {
            investmentContributionOverride:
              adjustment.investmentContributionOverride === null
                ? null
                : toNumber(adjustment.investmentContributionOverride),
            investmentReturnAdjustment:
              adjustment.investmentReturnAdjustment === null
                ? 0
                : toNumber(adjustment.investmentReturnAdjustment),
          }
        : {
            investmentContributionOverride: null,
            investmentReturnAdjustment: 0,
          },
    };
  }
}