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
exports.FinancialSettingsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../common/database/prisma.service");
const financial_date_1 = require("../../../common/domain/financial-date");
const money_1 = require("../../../common/domain/money");
const month_competency_1 = require("../../../common/domain/month-competency");
const audit_service_1 = require("../../audit/application/audit.service");
let FinancialSettingsService = class FinancialSettingsService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async getCurrent() {
        const record = await this.prisma.financialSettings.findFirst({
            where: { active: true },
            orderBy: { createdAt: 'desc' },
        });
        return record ? this.toContract(record) : null;
    }
    async upsert(input) {
        this.assertMoney(input.monthlyNetSalary);
        this.assertMoney(input.firstSalaryInstallmentAmount);
        this.assertMoney(input.defaultMonthlyContribution);
        this.assertMoney(input.initialOperationalBalance);
        this.assertMoney(input.initialInvestmentBalance);
        const secondSalaryInstallmentAmount = (0, month_competency_1.calculateSecondSalaryInstallmentAmount)({
            controlStartDate: input.controlStartDate,
            monthlyNetSalary: input.monthlyNetSalary,
            firstSalaryInstallmentAmount: input.firstSalaryInstallmentAmount,
            firstSalaryInstallmentDay: input.firstSalaryInstallmentDay,
            secondSalaryInstallmentAmount: '0.00',
            secondSalaryInstallmentDateRule: 'LAST_DAY_OF_MONTH',
            defaultMonthlyContribution: input.defaultMonthlyContribution,
            projectedMonthlyInvestmentYieldRate: input.projectedMonthlyInvestmentYieldRate,
            initialOperationalBalance: input.initialOperationalBalance,
            initialInvestmentBalance: input.initialInvestmentBalance,
        });
        const previous = await this.prisma.financialSettings.findFirst({
            where: { active: true },
            orderBy: { createdAt: 'desc' },
        });
        const data = {
            controlStartDate: (0, financial_date_1.parseLocalDate)(input.controlStartDate),
            monthlyNetSalary: new client_1.Prisma.Decimal(input.monthlyNetSalary),
            firstSalaryInstallmentAmount: new client_1.Prisma.Decimal(input.firstSalaryInstallmentAmount),
            firstSalaryInstallmentDay: input.firstSalaryInstallmentDay,
            secondSalaryInstallmentAmount: new client_1.Prisma.Decimal(secondSalaryInstallmentAmount),
            secondSalaryInstallmentDateRule: input.secondSalaryInstallmentDateRule,
            defaultMonthlyContribution: new client_1.Prisma.Decimal(input.defaultMonthlyContribution),
            projectedMonthlyInvestmentYieldRate: new client_1.Prisma.Decimal(input.projectedMonthlyInvestmentYieldRate),
            initialOperationalBalance: new client_1.Prisma.Decimal(input.initialOperationalBalance),
            initialInvestmentBalance: new client_1.Prisma.Decimal(input.initialInvestmentBalance),
            active: true,
        };
        const record = previous
            ? await this.prisma.financialSettings.update({ where: { id: previous.id }, data })
            : await this.prisma.financialSettings.create({ data });
        await this.auditService.record({
            entityName: 'FINANCIAL_SETTINGS',
            entityId: record.id,
            operation: previous ? 'UPDATE' : 'CREATE',
            changeOrigin: 'LOCAL_USER',
            previousValues: previous ?? null,
            nextValues: record,
        });
        return this.toContract(record);
    }
    async previewStartDate(input) {
        const current = await this.getCurrent();
        if (!current) {
            return {
                summary: 'Nenhuma configuração financeira ativa encontrada.',
                affectedMonths: [],
                affectedOpenInstallments: 0,
                affectedRealizedEntries: 0,
                warnings: ['Crie a configuração financeira antes de alterar a data inicial.'],
            };
        }
        const currentStart = current.controlStartDate;
        const nextStart = input.newControlStartDate;
        const affectedMonths = this.buildAffectedMonths(currentStart, nextStart);
        const movedEarlier = (0, financial_date_1.compareMonthStarts)(nextStart, currentStart) < 0;
        return {
            summary: movedEarlier ? 'A data inicial será antecipada.' : 'A data inicial será adiada.',
            affectedMonths: affectedMonths ?? [],
            affectedOpenInstallments: 0,
            affectedRealizedEntries: 0,
            warnings: movedEarlier
                ? ['Meses novos passarão a gerar automações a partir da nova data.']
                : ['Meses anteriores à nova data deixarão de gerar automações automáticas.'],
        };
    }
    buildAffectedMonths(currentStart, nextStart) {
        if (currentStart === nextStart) {
            return [];
        }
        const start = (0, financial_date_1.compareMonthStarts)(currentStart, nextStart) < 0 ? currentStart : nextStart;
        const end = (0, financial_date_1.compareMonthStarts)(currentStart, nextStart) < 0 ? nextStart : currentStart;
        const months = [];
        let cursor = start;
        while ((0, financial_date_1.compareMonthStarts)(cursor, end) < 0) {
            months.push(cursor);
            cursor = (0, financial_date_1.addMonths)(cursor, 1);
        }
        return months;
    }
    toContract(record) {
        return {
            controlStartDate: (0, financial_date_1.formatLocalDate)(record.controlStartDate),
            monthlyNetSalary: record.monthlyNetSalary.toString(),
            firstSalaryInstallmentAmount: record.firstSalaryInstallmentAmount.toString(),
            firstSalaryInstallmentDay: record.firstSalaryInstallmentDay,
            secondSalaryInstallmentAmount: record.secondSalaryInstallmentAmount.toString(),
            secondSalaryInstallmentDateRule: record.secondSalaryInstallmentDateRule,
            defaultMonthlyContribution: record.defaultMonthlyContribution.toString(),
            projectedMonthlyInvestmentYieldRate: record.projectedMonthlyInvestmentYieldRate.toString(),
            initialOperationalBalance: record.initialOperationalBalance.toString(),
            initialInvestmentBalance: record.initialInvestmentBalance.toString(),
        };
    }
    assertMoney(value) {
        if (!(0, money_1.isPositiveMoneyString)(value) && value !== '0.00') {
            throw new Error(`Valor monetário inválido: ${value}`);
        }
    }
};
exports.FinancialSettingsService = FinancialSettingsService;
exports.FinancialSettingsService = FinancialSettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService])
], FinancialSettingsService);
