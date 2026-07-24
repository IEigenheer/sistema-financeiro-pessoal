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
exports.MonthlyOverviewService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/database/prisma.service");
const financial_date_1 = require("../../../common/domain/financial-date");
const month_competency_1 = require("../../../common/domain/month-competency");
let MonthlyOverviewService = class MonthlyOverviewService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMonthlyOverview(month) {
        const settings = await this.prisma.financialSettings.findFirst({
            where: { active: true },
            orderBy: { createdAt: 'desc' },
        });
        if (!settings) {
            return this.emptyOverview(month);
        }
        const snapshot = this.toSnapshot(settings);
        const overview = (0, month_competency_1.computeMonthlyOverview)(month, snapshot);
        if (overview.withinControlPeriod) {
            await this.prisma.monthlyCompetency.upsert({
                where: { monthStart: (0, financial_date_1.parseMonthStart)(overview.month) },
                create: this.toMaterializedRow(snapshot, overview),
                update: this.toMaterializedRow(snapshot, overview),
            });
        }
        return overview;
    }
    toMaterializedRow(snapshot, overview) {
        return {
            monthStart: (0, financial_date_1.parseMonthStart)(overview.month),
            controlStartDateSnapshot: (0, financial_date_1.parseMonthStart)(snapshot.controlStartDate),
            openingOperationalBalance: overview.openingOperationalBalance,
            openingInvestmentBalance: overview.openingInvestmentBalance,
            plannedSalaryInstallments: overview.plannedSalaryInstallments,
            plannedIncome: overview.plannedIncome,
            realizedIncome: overview.realizedIncome,
            plannedFixedExpenses: overview.plannedFixedExpenses,
            realizedExpenses: overview.realizedExpenses,
            variableExpenses: overview.variableExpenses,
            installments: overview.installments,
            contributions: overview.contributions,
            yields: overview.yields,
            operationalBalance: overview.operationalBalance,
            investmentBalance: overview.investmentBalance,
            plannedVsRealizedDelta: overview.plannedVsRealizedDelta,
        };
    }
    emptyOverview(month) {
        const normalizedMonth = month.endsWith('-01') ? month : `${month}-01`;
        return {
            month: normalizedMonth,
            withinControlPeriod: false,
            openingOperationalBalance: '0.00',
            openingInvestmentBalance: '0.00',
            plannedSalaryInstallments: [],
            plannedIncome: '0.00',
            realizedIncome: '0.00',
            plannedFixedExpenses: '0.00',
            realizedExpenses: '0.00',
            variableExpenses: '0.00',
            installments: '0.00',
            contributions: '0.00',
            yields: '0.00',
            operationalBalance: '0.00',
            investmentBalance: '0.00',
            plannedVsRealizedDelta: '0.00',
        };
    }
    toSnapshot(settings) {
        return {
            controlStartDate: (0, financial_date_1.formatLocalDate)(settings.controlStartDate),
            monthlyNetSalary: settings.monthlyNetSalary.toString(),
            firstSalaryInstallmentAmount: settings.firstSalaryInstallmentAmount.toString(),
            firstSalaryInstallmentDay: settings.firstSalaryInstallmentDay,
            secondSalaryInstallmentAmount: settings.secondSalaryInstallmentAmount.toString(),
            secondSalaryInstallmentDateRule: settings.secondSalaryInstallmentDateRule,
            defaultMonthlyContribution: settings.defaultMonthlyContribution.toString(),
            projectedMonthlyInvestmentYieldRate: settings.projectedMonthlyInvestmentYieldRate.toString(),
            initialOperationalBalance: settings.initialOperationalBalance.toString(),
            initialInvestmentBalance: settings.initialInvestmentBalance.toString(),
        };
    }
};
exports.MonthlyOverviewService = MonthlyOverviewService;
exports.MonthlyOverviewService = MonthlyOverviewService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MonthlyOverviewService);
