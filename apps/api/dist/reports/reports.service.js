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
exports.ReportsService = void 0;
// @ts-nocheck
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const configuration_service_1 = require("../configuration/configuration.service");
const months_service_1 = require("../months/months.service");
const date_utils_1 = require("../common/date-utils");
const money_1 = require("../common/money");
let ReportsService = class ReportsService {
    prisma;
    configurationService;
    monthsService;
    constructor(prisma, configurationService, monthsService) {
        this.prisma = prisma;
        this.configurationService = configurationService;
        this.monthsService = monthsService;
    }
    async getOverview(year) {
        const settings = await this.configurationService.getSettings();
        const activeYear = year ?? settings.referenceYear;
        const [accounts, currentMonthDetail, dashboard] = await Promise.all([
            this.monthsService.getAccountsOverview(activeYear),
            this.monthsService.getMonth(activeYear, settings.currentMonthReference.getUTCMonth() + 1),
            this.getDashboard(activeYear),
        ]);
        return {
            settings,
            year: activeYear,
            currentMonth: settings.currentMonthReference.getUTCMonth() + 1,
            accounts,
            currentMonthDetail,
            dashboard,
        };
    }
    async simulate(dto) {
        const settings = await this.configurationService.getSettings();
        const year = settings.referenceYear;
        const accounts = await this.monthsService.getAccountsOverview(year);
        const startMonth = dto.startMonth ?? (settings.currentMonthReference.getUTCMonth() + 1);
        const accountRow = accounts.find((item) => item.month === startMonth);
        const currentChecking = (0, money_1.toNumber)(accountRow?.checkingBalance);
        const currentInvestment = (0, money_1.toNumber)(accountRow?.investmentBalance);
        const plans = await this.prisma.installmentPlan.findMany();
        let xChecking = currentChecking;
        let xInvestment = currentInvestment;
        let yChecking = currentChecking;
        let yInvestment = currentInvestment;
        const firstSimulationMonth = (0, date_utils_1.addMonths)((0, date_utils_1.toMonthStart)(year, startMonth), 2);
        const rows = Array.from({ length: dto.monthsToSimulate }, (_, index) => {
            const simulationDate = (0, date_utils_1.addMonths)(firstSimulationMonth, index);
            const existingInstallments = (0, money_1.roundCurrency)(plans
                .filter((plan) => plan.firstInstallmentMonth <= simulationDate && plan.lastInstallmentMonth >= simulationDate)
                .reduce((sum, plan) => sum + (0, money_1.toNumber)(plan.monthlyAmount), 0));
            xChecking = (0, money_1.roundCurrency)(xChecking + dto.salaryMonthly - dto.fixedMonthlyExpense - dto.variableMonthlyExpense - existingInstallments - dto.investmentX);
            xInvestment = (0, money_1.roundCurrency)(xInvestment * (1 + dto.monthlyReturnRate) + dto.investmentX);
            yChecking = (0, money_1.roundCurrency)(yChecking + dto.salaryMonthly - dto.fixedMonthlyExpense - dto.variableMonthlyExpense - existingInstallments - dto.investmentY);
            yInvestment = (0, money_1.roundCurrency)(yInvestment * (1 + dto.monthlyReturnRate) + dto.investmentY);
            const purchaseInstallment = dto.purchaseMode === 'installment'
                ? index + 1 >= dto.purchaseStartMonthIndex &&
                    index + 1 < dto.purchaseStartMonthIndex + dto.purchaseInstallmentCount
                    ? (0, money_1.roundCurrency)(dto.purchaseValue / dto.purchaseInstallmentCount)
                    : 0
                : index + 1 === dto.purchaseStartMonthIndex
                    ? dto.purchaseValue
                    : 0;
            const xCheckingWithPurchase = (0, money_1.roundCurrency)(xChecking - purchaseInstallment);
            return {
                monthIndex: index + 1,
                date: simulationDate,
                existingInstallments,
                xCheckingWithoutPurchase: xChecking,
                xInvestmentBalance: xInvestment,
                xNetWorthWithoutPurchase: (0, money_1.roundCurrency)(xChecking + xInvestment),
                yCheckingWithoutPurchase: yChecking,
                yInvestmentBalance: yInvestment,
                yNetWorthWithoutPurchase: (0, money_1.roundCurrency)(yChecking + yInvestment),
                purchaseInstallment,
                xCheckingWithPurchase,
                xNetWorthWithPurchase: (0, money_1.roundCurrency)(xCheckingWithPurchase + xInvestment),
            };
        });
        return {
            startMonth,
            baseCheckingBalance: currentChecking,
            baseInvestmentBalance: currentInvestment,
            rows,
        };
    }
    async getDashboard(year) {
        const [categories, fixedStatuses, variableExpenses, settings] = await Promise.all([
            this.prisma.category.findMany({ orderBy: { name: 'asc' } }),
            this.prisma.monthlyFixedExpenseStatus.findMany({
                where: { year, status: 'PAID' },
                include: { fixedExpenseTemplate: true },
            }),
            this.prisma.variableExpense.findMany({ where: { year } }),
            this.configurationService.getSettings(),
        ]);
        const startMonth = settings.controlStartDate.getUTCMonth() + 1;
        return categories.map((category) => {
            const monthlyTotals = Array.from({ length: 12 }, (_, index) => {
                const month = index + 1;
                if (month < startMonth) {
                    return 0;
                }
                const fixedTotal = fixedStatuses
                    .filter((item) => item.month === month && item.fixedExpenseTemplate.categoryId === category.id)
                    .reduce((sum, item) => sum + (0, money_1.toNumber)(item.paidAmount), 0);
                const variableTotal = variableExpenses
                    .filter((item) => item.month === month && item.categoryId === category.id)
                    .reduce((sum, item) => sum + (0, money_1.toNumber)(item.amount), 0);
                return (0, money_1.roundCurrency)(fixedTotal + variableTotal);
            });
            return {
                categoryId: category.id,
                categoryName: category.name,
                type: category.type,
                monthlyTotals,
                totalYear: (0, money_1.roundCurrency)(monthlyTotals.reduce((sum, value) => sum + value, 0)),
            };
        });
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        configuration_service_1.ConfigurationService,
        months_service_1.MonthsService])
], ReportsService);
