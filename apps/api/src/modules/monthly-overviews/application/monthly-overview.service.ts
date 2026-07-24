import { Injectable } from '@nestjs/common';
import { FinancialSettings as PrismaFinancialSettings, Prisma } from '@prisma/client';

import { MonthlyOverview as MonthlyOverviewContract } from '@finance/contracts';

import { PrismaService } from '../../../common/database/prisma.service';
import { formatLocalDate, parseMonthStart } from '../../../common/domain/financial-date';
import { FinancialSettingsSnapshot, computeMonthlyOverview } from '../../../common/domain/month-competency';

@Injectable()
export class MonthlyOverviewService {
  constructor(private readonly prisma: PrismaService) {}

  async getMonthlyOverview(month: string): Promise<MonthlyOverviewContract> {
    const settings = await this.prisma.financialSettings.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!settings) {
      return this.emptyOverview(month);
    }

    const snapshot = this.toSnapshot(settings);
    const overview = computeMonthlyOverview(month, snapshot);

    if (overview.withinControlPeriod) {
      await this.prisma.monthlyCompetency.upsert({
        where: { monthStart: parseMonthStart(overview.month) },
        create: this.toMaterializedRow(snapshot, overview as MonthlyOverviewContract),
        update: this.toMaterializedRow(snapshot, overview as MonthlyOverviewContract),
      });
    }

    return overview as MonthlyOverviewContract;
  }

  private toMaterializedRow(snapshot: FinancialSettingsSnapshot, overview: MonthlyOverviewContract) {
    return {
      monthStart: parseMonthStart(overview.month),
      controlStartDateSnapshot: parseMonthStart(snapshot.controlStartDate),
      openingOperationalBalance: overview.openingOperationalBalance,
      openingInvestmentBalance: overview.openingInvestmentBalance,
      plannedSalaryInstallments: overview.plannedSalaryInstallments as unknown as Prisma.InputJsonValue,
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

  private emptyOverview(month: string): MonthlyOverviewContract {
    const normalizedMonth = month.endsWith('-01') ? month : `${month}-01`;
    return {
      month: normalizedMonth as MonthlyOverviewContract['month'],
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

  private toSnapshot(settings: PrismaFinancialSettings): FinancialSettingsSnapshot {
    return {
      controlStartDate: formatLocalDate(settings.controlStartDate),
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
}
