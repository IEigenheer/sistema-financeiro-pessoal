import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '../../../common/database/prisma.service';
import type { AuditService } from '../../audit/application/audit.service';

import { FinancialSettingsService } from './financial-settings.service';

describe('FinancialSettingsService', () => {
  const prisma = {
    financialSettings: {
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
  } as unknown as PrismaService;
  const recordSpy = vi.fn();
  const auditService = {
    record: recordSpy,
  } as unknown as AuditService;

  let service: FinancialSettingsService;

  beforeEach(() => {
    vi.resetAllMocks();
    service = new FinancialSettingsService(prisma, auditService);
  });

  it('computes the second salary installment as the remaining salary', async () => {
    prisma.financialSettings.findFirst = vi.fn().mockResolvedValue(null);
    prisma.financialSettings.create = vi.fn().mockResolvedValue({
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

    expect(result.secondSalaryInstallmentAmount).toBe('5500.00');
    expect(recordSpy).toHaveBeenCalledTimes(1);
  });

  it('returns a preview when moving the control start date', async () => {
    prisma.financialSettings.findFirst = vi.fn().mockResolvedValue({
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
    expect(preview.affectedMonths).toContain('2026-01-01');
    expect(preview.summary).toContain('adiada');
  });
});
