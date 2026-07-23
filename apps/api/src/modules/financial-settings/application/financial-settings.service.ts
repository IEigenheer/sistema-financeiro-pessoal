import { ChangeImpactPreview, FinancialSettings as FinancialSettingsContract, StartDatePreviewRequest } from '@finance/contracts';
import { Injectable } from '@nestjs/common';
import { FinancialSettings as PrismaFinancialSettings, Prisma } from '@prisma/client';

import { PrismaService } from '../../../common/database/prisma.service';
import { addMonths, compareMonthStarts, formatLocalDate, parseLocalDate } from '../../../common/domain/financial-date';
import { isPositiveMoneyString } from '../../../common/domain/money';
import { calculateSecondSalaryInstallmentAmount } from '../../../common/domain/month-competency';
import { AuditService } from '../../audit/application/audit.service';
import { StartDatePreviewDto } from '../interfaces/http/dto/start-date-preview.dto';
import { UpsertFinancialSettingsDto } from '../interfaces/http/dto/upsert-financial-settings.dto';

@Injectable()
export class FinancialSettingsService {
  constructor(private readonly prisma: PrismaService, private readonly auditService: AuditService) {}

  async getCurrent(): Promise<FinancialSettingsContract | null> {
    const record = await this.prisma.financialSettings.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });

    return record ? this.toContract(record) : null;
  }

  async upsert(input: UpsertFinancialSettingsDto): Promise<FinancialSettingsContract> {
    this.assertMoney(input.monthlyNetSalary);
    this.assertMoney(input.firstSalaryInstallmentAmount);
    this.assertMoney(input.defaultMonthlyContribution);
    this.assertMoney(input.initialOperationalBalance);
    this.assertMoney(input.initialInvestmentBalance);

    const secondSalaryInstallmentAmount = calculateSecondSalaryInstallmentAmount({
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
      controlStartDate: parseLocalDate(input.controlStartDate),
      monthlyNetSalary: new Prisma.Decimal(input.monthlyNetSalary),
      firstSalaryInstallmentAmount: new Prisma.Decimal(input.firstSalaryInstallmentAmount),
      firstSalaryInstallmentDay: input.firstSalaryInstallmentDay,
      secondSalaryInstallmentAmount: new Prisma.Decimal(secondSalaryInstallmentAmount),
      secondSalaryInstallmentDateRule: input.secondSalaryInstallmentDateRule,
      defaultMonthlyContribution: new Prisma.Decimal(input.defaultMonthlyContribution),
      projectedMonthlyInvestmentYieldRate: new Prisma.Decimal(input.projectedMonthlyInvestmentYieldRate),
      initialOperationalBalance: new Prisma.Decimal(input.initialOperationalBalance),
      initialInvestmentBalance: new Prisma.Decimal(input.initialInvestmentBalance),
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

  async previewStartDate(input: StartDatePreviewDto | StartDatePreviewRequest): Promise<ChangeImpactPreview> {
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
    const affectedMonths = this.buildAffectedMonths(currentStart, nextStart) as ChangeImpactPreview['affectedMonths'];
    const movedEarlier = compareMonthStarts(nextStart, currentStart) < 0;

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

  private buildAffectedMonths(currentStart: string, nextStart: string): string[] {
    if (currentStart === nextStart) {
      return [];
    }

    const start = compareMonthStarts(currentStart, nextStart) < 0 ? currentStart : nextStart;
    const end = compareMonthStarts(currentStart, nextStart) < 0 ? nextStart : currentStart;
    const months: string[] = [];
    let cursor = start;

    while (compareMonthStarts(cursor, end) < 0) {
      months.push(cursor);
      cursor = addMonths(cursor, 1);
    }

    return months;
  }

  private toContract(record: PrismaFinancialSettings): FinancialSettingsContract {
    return {
      controlStartDate: formatLocalDate(record.controlStartDate),
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

  private assertMoney(value: string): void {
    if (!isPositiveMoneyString(value) && value !== '0.00') {
      throw new Error(`Valor monetário inválido: ${value}`);
    }
  }
}
