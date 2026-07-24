"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonthsService = void 0;
// @ts-nocheck
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const configuration_service_1 = require("../configuration/configuration.service");
const date_utils_1 = require("../common/date-utils");
const money_1 = require("../common/money");
const constants_1 = require("../common/constants");
const FixedExpenseStatus = {
    PENDING: 'PENDING',
    PAID: 'PAID',
};
let MonthsService = class MonthsService {
    prisma;
    configurationService;
    constructor(prisma, configurationService) {
        this.prisma = prisma;
        this.configurationService = configurationService;
    }
    async getMonth(year, month) {
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
    async getAccountsOverview(year) {
        const context = await this.getYearContext(year);
        const startMonth = (0, date_utils_1.normalizeMonthDate)(context.settings.controlStartDate);
        const rows = [];
        let previousChecking = 0;
        let previousInvestment = 0;
        let hasStarted = false;
        for (let month = 1; month <= 12; month += 1) {
            const summary = this.composeMonthSummary(year, month, context);
            const monthDate = (0, date_utils_1.toMonthStart)(year, month);
            if (monthDate < startMonth) {
                rows.push({
                    month,
                    label: constants_1.MONTH_NAMES[month - 1],
                    entriesTotal: 0,
                    fixedPlannedTotal: 0,
                    fixedPaidTotal: 0,
                    variableTotal: 0,
                    installmentTotal: 0,
                    investmentContribution: 0,
                    checkingBalance: null,
                    investmentReturnAdjustment: 0,
                    investmentBalance: null,
                    netWorth: null,
                });
                continue;
            }
            const contribution = summary.investmentContribution;
            const investmentReturnAdjustment = summary.adjustment?.investmentReturnAdjustment ?? 0;
            const checkingBalance = (0, money_1.roundCurrency)((hasStarted ? previousChecking : (0, money_1.toNumber)(context.settings.initialCheckingBalance)) +
                summary.entriesTotal -
                summary.fixedPlannedTotal -
                summary.variableTotal -
                summary.installmentTotal -
                contribution);
            const investmentBalance = (0, money_1.roundCurrency)((hasStarted ? previousInvestment : (0, money_1.toNumber)(context.settings.initialInvestmentBalance)) +
                contribution +
                investmentReturnAdjustment);
            const netWorth = (0, money_1.roundCurrency)(checkingBalance + investmentBalance);
            hasStarted = true;
            previousChecking = checkingBalance;
            previousInvestment = investmentBalance;
            rows.push({
                month,
                label: constants_1.MONTH_NAMES[month - 1],
                entriesTotal: summary.entriesTotal,
                fixedPlannedTotal: summary.fixedPlannedTotal,
                fixedPaidTotal: summary.fixedPaidTotal,
                variableTotal: summary.variableTotal,
                installmentTotal: summary.installmentTotal,
                investmentContribution: contribution,
                checkingBalance,
                investmentReturnAdjustment,
                investmentBalance,
                netWorth,
            });
        }
        return rows;
    }
    async createIncome(year, month, dto) {
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
    async createVariableExpense(year, month, dto) {
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
    async updateFixedExpenseStatus(year, month, templateId, dto) {
        const template = await this.prisma.fixedExpenseTemplate.findUniqueOrThrow({
            where: { id: templateId },
        });
        const paidAmount = dto.status === FixedExpenseStatus.PAID
            ? (0, money_1.roundCurrency)(dto.paidAmount ?? (0, money_1.toNumber)(template.defaultAmount))
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
    async updateAdjustment(year, month, dto) {
        const payload = {};
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
    async buildMonthDetails(year, month, settings) {
        const context = await this.getYearContext(year, settings);
        return this.composeMonthSummary(year, month, context);
    }
    async getYearContext(year, providedSettings) {
        const settings = providedSettings ?? (await this.configurationService.getSettings());
        const [templates, incomes, statuses, variableExpenses, installments, adjustments] = await Promise.all([
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
    composeMonthSummary(year, month, context) {
        const monthDate = (0, date_utils_1.toMonthStart)(year, month);
        const startMonth = (0, date_utils_1.normalizeMonthDate)(context.settings.controlStartDate);
        const isActive = monthDate >= startMonth;
        const statusMap = new Map(context.statuses
            .filter((item) => item.month === month)
            .map((item) => [item.fixedExpenseTemplateId, item]));
        const adjustment = context.adjustments.find((item) => item.month === month) ?? null;
        const contribution = isActive
            ? (0, money_1.roundCurrency)(adjustment?.investmentContributionOverride !== null &&
                adjustment?.investmentContributionOverride !== undefined
                ? (0, money_1.toNumber)(adjustment.investmentContributionOverride)
                : (0, money_1.toNumber)(context.settings.monthlyInvestmentContribution))
            : 0;
        const incomes = isActive
            ? [
                {
                    type: 'salary',
                    description: 'Salário - 1ª parcela',
                    day: context.settings.salaryFirstInstallmentDay,
                    amount: (0, money_1.toNumber)(context.settings.salaryFirstInstallment),
                },
                {
                    type: 'salary',
                    description: 'Salário - 2ª parcela',
                    day: 'Último dia do mês',
                    amount: (0, money_1.toNumber)(context.settings.salarySecondInstallment),
                },
                ...context.incomes
                    .filter((item) => item.month === month)
                    .map((item) => ({
                    id: item.id,
                    type: 'custom',
                    description: item.description,
                    day: item.day,
                    amount: (0, money_1.toNumber)(item.amount),
                    kind: item.kind,
                })),
            ]
            : [];
        const fixedExpenses = context.templates.map((template) => {
            const status = statusMap.get(template.id);
            const paidAmount = isActive ? (0, money_1.toNumber)(status?.paidAmount) : 0;
            const currentStatus = status?.status ?? FixedExpenseStatus.PENDING;
            return {
                id: template.id,
                description: template.description,
                categoryId: template.categoryId,
                categoryName: template.category.name,
                plannedAmount: isActive ? (0, money_1.toNumber)(template.defaultAmount) : 0,
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
                amount: (0, money_1.toNumber)(item.amount),
                expenseDate: item.expenseDate,
                categoryId: item.categoryId,
                categoryName: item.category.name,
            }))
            : [];
        const activeInstallments = isActive
            ? context.installments
                .filter((item) => item.firstInstallmentMonth <= monthDate && item.lastInstallmentMonth >= monthDate)
                .map((item) => ({
                id: item.id,
                description: item.description,
                categoryName: item.category.name,
                installmentAmount: (0, money_1.toNumber)(item.monthlyAmount),
                installmentCount: item.installmentCount,
                installmentNumber: (0, date_utils_1.monthDiff)(item.firstInstallmentMonth, monthDate) + 1,
                paymentSource: item.paymentSource,
            }))
            : [];
        const entriesTotal = (0, money_1.roundCurrency)(incomes.reduce((sum, item) => sum + (0, money_1.toNumber)(item.amount), 0));
        const fixedPlannedTotal = (0, money_1.roundCurrency)(fixedExpenses.reduce((sum, item) => sum + (0, money_1.toNumber)(item.plannedAmount), 0));
        const fixedPaidTotal = (0, money_1.roundCurrency)(fixedExpenses.reduce((sum, item) => sum + (0, money_1.toNumber)(item.paidAmount), 0));
        const variableTotal = (0, money_1.roundCurrency)(variableExpenses.reduce((sum, item) => sum + (0, money_1.toNumber)(item.amount), 0));
        const installmentTotal = (0, money_1.roundCurrency)(activeInstallments.reduce((sum, item) => sum + (0, money_1.toNumber)(item.installmentAmount), 0));
        const availableBalance = (0, money_1.roundCurrency)(entriesTotal - fixedPaidTotal - variableTotal - installmentTotal - contribution);
        return {
            year,
            month,
            label: (0, date_utils_1.formatMonthLabel)(year, month),
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
            investmentContribution: contribution,
            availableBalance,
            adjustment: adjustment
                ? {
                    investmentContributionOverride: adjustment.investmentContributionOverride === null
                        ? null
                        : (0, money_1.toNumber)(adjustment.investmentContributionOverride),
                    investmentReturnAdjustment: adjustment.investmentReturnAdjustment === null
                        ? 0
                        : (0, money_1.toNumber)(adjustment.investmentReturnAdjustment),
                }
                : {
                    investmentContributionOverride: null,
                    investmentReturnAdjustment: 0,
                },
        };
    }
};
exports.MonthsService = MonthsService;
exports.MonthsService = MonthsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        configuration_service_1.ConfigurationService])
], MonthsService);
