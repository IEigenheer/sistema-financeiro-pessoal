"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
// @ts-nocheck
const common_1 = require("@nestjs/common");
const XLSX = __importStar(require("xlsx"));
const prisma_service_1 = require("../prisma/prisma.service");
const constants_1 = require("../common/constants");
const date_utils_1 = require("../common/date-utils");
const money_1 = require("../common/money");
const CategoryType = {
    FIXED: 'FIXED',
    VARIABLE: 'VARIABLE',
};
const CustomIncomeKind = {
    FIXED_EXTRA: 'FIXED_EXTRA',
    VARIABLE_EXTRA: 'VARIABLE_EXTRA',
    OTHER: 'OTHER',
};
const FixedExpenseStatus = {
    PENDING: 'PENDING',
    PAID: 'PAID',
};
let SeedService = SeedService_1 = class SeedService {
    prisma;
    logger = new common_1.Logger(SeedService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async seedIfNeeded() {
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
            salaryNetTotal: (0, money_1.toNumber)(this.cell(configSheet, 'E4')),
            salaryFirstInstallment: (0, money_1.toNumber)(this.cell(configSheet, 'E5')),
            salarySecondInstallment: (0, money_1.toNumber)(this.cell(configSheet, 'E6')),
            salaryFirstInstallmentDay: Number(this.cell(configSheet, 'E7')),
            salarySecondInstallmentLast: true,
            monthlyInvestmentContribution: (0, money_1.toNumber)(this.cell(configSheet, 'E9')),
            projectedMonthlyReturnRate: Number(this.cell(configSheet, 'E10') ?? 0),
            initialCheckingBalance: (0, money_1.toNumber)(this.cell(contasSheet, 'D3')),
            initialInvestmentBalance: (0, money_1.toNumber)(this.cell(contasSheet, 'F3')),
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
    parseWorkbook(workbook, referenceYear, defaultContribution) {
        const categoriesSheet = workbook.Sheets.Categorias;
        const fixedSheet = workbook.Sheets.DespesasFixas;
        const installmentSheet = workbook.Sheets.Parcelamentos;
        const contasSheet = workbook.Sheets.Contas;
        const categories = [];
        const extraCategoryNames = new Set();
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
            const defaultAmount = (0, money_1.toNumber)(this.cell(fixedSheet, `C${row}`));
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
            const totalAmount = (0, money_1.toNumber)(this.cell(installmentSheet, `D${row}`));
            const installmentCount = Number(this.cell(installmentSheet, `E${row}`) ?? 0);
            if (!description || !categoryName || !totalAmount || !installmentCount) {
                continue;
            }
            extraCategoryNames.add(categoryName);
            const purchaseDate = this.excelDate(this.cell(installmentSheet, `G${row}`));
            const firstInstallmentMonth = this.excelDate(this.cell(installmentSheet, `H${row}`), true);
            const lastInstallmentMonthRaw = this.cell(installmentSheet, `I${row}`);
            const lastInstallmentMonth = lastInstallmentMonthRaw !== undefined && lastInstallmentMonthRaw !== null
                ? this.excelDate(lastInstallmentMonthRaw, true)
                : (0, date_utils_1.addMonths)(firstInstallmentMonth, installmentCount - 1);
            installments.push({
                description,
                categoryName,
                totalAmount,
                installmentCount,
                monthlyAmount: (0, money_1.roundCurrency)((0, money_1.toNumber)(this.cell(installmentSheet, `F${row}`)) || totalAmount / installmentCount),
                purchaseDate,
                firstInstallmentMonth,
                lastInstallmentMonth,
                paymentSource: this.cleanString(this.cell(installmentSheet, `J${row}`)) || 'Não informado',
            });
        }
        for (const monthName of constants_1.MONTH_NAMES) {
            const sheet = workbook.Sheets[monthName];
            if (!sheet) {
                continue;
            }
            const month = constants_1.MONTH_NAME_TO_NUMBER[monthName.toLowerCase()];
            for (let offset = 0; offset < 4; offset += 1) {
                const row = 7 + offset;
                const description = this.cleanString(this.cell(sheet, `A${row}`));
                const amount = (0, money_1.toNumber)(this.cell(sheet, `C${row}`));
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
                    paidAmount: (0, money_1.toNumber)(this.cell(sheet, `E${row}`)),
                });
            }
            for (let row = 5; row <= 34; row += 1) {
                const description = this.cleanString(this.cell(sheet, `J${row}`));
                const categoryName = this.cleanString(this.cell(sheet, `K${row}`));
                const amount = (0, money_1.toNumber)(this.cell(sheet, `L${row}`));
                if (!description || !amount) {
                    continue;
                }
                if (categoryName) {
                    extraCategoryNames.add(categoryName);
                }
                const dateValue = this.cell(sheet, `I${row}`);
                const expenseDate = typeof dateValue === 'number' ? this.excelDate(dateValue) : (0, date_utils_1.toMonthStart)(referenceYear, month);
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
            const contributionNumber = typeof contributionValue === 'number' ? (0, money_1.roundCurrency)(contributionValue) : null;
            const returnAdjustmentNumber = typeof returnAdjustmentValue === 'number' ? (0, money_1.roundCurrency)(returnAdjustmentValue) : null;
            if (contributionNumber === null && returnAdjustmentNumber === null) {
                continue;
            }
            adjustments.push({
                year: referenceYear,
                month,
                investmentContributionOverride: contributionNumber !== null && contributionNumber !== defaultContribution ? contributionNumber : null,
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
    requireCategory(categoryMap, name) {
        const categoryId = categoryMap.get(name);
        if (!categoryId) {
            throw new Error(`Categoria não encontrada durante a importação: ${name}`);
        }
        return categoryId;
    }
    cell(sheet, address) {
        return sheet?.[address]?.v;
    }
    cleanString(value) {
        return typeof value === 'string' ? value.trim() : '';
    }
    excelDate(value, normalizeToMonthStart = false) {
        if (value instanceof Date) {
            return normalizeToMonthStart ? (0, date_utils_1.toMonthStart)(value.getUTCFullYear(), value.getUTCMonth() + 1) : value;
        }
        if (typeof value !== 'number') {
            throw new Error(`Valor de data inválido na planilha: ${value}`);
        }
        const parsed = XLSX.SSF.parse_date_code(value);
        if (!parsed) {
            throw new Error(`Não foi possível converter a data do Excel: ${value}`);
        }
        return normalizeToMonthStart ? (0, date_utils_1.toMonthStart)(parsed.y, parsed.m) : new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SeedService);
