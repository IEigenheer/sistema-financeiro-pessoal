"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const financial_settings_service_1 = require("./financial-settings.service");
(0, vitest_1.describe)('FinancialSettingsService', () => {
    const prisma = {
        financialSettings: {
            findFirst: vitest_1.vi.fn(),
            update: vitest_1.vi.fn(),
            create: vitest_1.vi.fn(),
        },
    };
    const recordSpy = vitest_1.vi.fn();
    const auditService = {
        record: recordSpy,
    };
    let service;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.resetAllMocks();
        service = new financial_settings_service_1.FinancialSettingsService(prisma, auditService);
    });
    (0, vitest_1.it)('computes the second salary installment as the remaining salary', async () => {
        prisma.financialSettings.findFirst = vitest_1.vi.fn().mockResolvedValue(null);
        prisma.financialSettings.create = vitest_1.vi.fn().mockResolvedValue({
            id: 'settings-id',
            controlStartDate: new Date('2026-01-01T00:00:00.000Z'),
            monthlyNetSalary: { toString: () => '8500.00' },
            firstSalaryInstallmentAmount: { toString: () => '3000.00' },
            firstSalaryInstallmentDay: 15,
            secondSalaryInstallmentAmount: { toString: () => '5500.00' },
            secondSalaryInstallmentDateRule: 'LAST_DAY_OF_MONTH',
            defaultMonthlyContribution: { toString: () => '2500.00' },
            projectedMonthlyInvestmentYieldRate: { toString: () => '0.00800000' },
            initialOperationalBalance: { toString: () => '2500.00' },
            initialInvestmentBalance: { toString: () => '10000.00' },
        });
        const result = await service.upsert({
            controlStartDate: '2026-01-01',
            monthlyNetSalary: '8500.00',
            firstSalaryInstallmentAmount: '3000.00',
            firstSalaryInstallmentDay: 15,
            defaultMonthlyContribution: '2500.00',
            projectedMonthlyInvestmentYieldRate: '0.00800000',
            initialOperationalBalance: '2500.00',
            initialInvestmentBalance: '10000.00',
            secondSalaryInstallmentDateRule: 'LAST_DAY_OF_MONTH',
        });
        (0, vitest_1.expect)(result.secondSalaryInstallmentAmount).toBe('5500.00');
        (0, vitest_1.expect)(recordSpy).toHaveBeenCalledTimes(1);
    });
    (0, vitest_1.it)('returns a preview when moving the control start date', async () => {
        prisma.financialSettings.findFirst = vitest_1.vi.fn().mockResolvedValue({
            id: 'settings-id',
            controlStartDate: new Date('2026-01-01T00:00:00.000Z'),
            monthlyNetSalary: { toString: () => '8500.00' },
            firstSalaryInstallmentAmount: { toString: () => '3000.00' },
            firstSalaryInstallmentDay: 15,
            secondSalaryInstallmentAmount: { toString: () => '5500.00' },
            secondSalaryInstallmentDateRule: 'LAST_DAY_OF_MONTH',
            defaultMonthlyContribution: { toString: () => '2500.00' },
            projectedMonthlyInvestmentYieldRate: { toString: () => '0.00800000' },
            initialOperationalBalance: { toString: () => '2500.00' },
            initialInvestmentBalance: { toString: () => '10000.00' },
        });
        const preview = await service.previewStartDate({ newControlStartDate: '2026-03-01' });
        (0, vitest_1.expect)(preview.affectedMonths).toContain('2026-01-01');
        (0, vitest_1.expect)(preview.summary).toContain('adiada');
    });
});
