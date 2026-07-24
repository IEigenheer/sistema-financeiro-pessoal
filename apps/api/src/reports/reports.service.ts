// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { MonthsService } from '../months/months.service';
import { addMonths, toMonthStart } from '../common/date-utils';
import { roundCurrency, toNumber } from '../common/money';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configurationService: ConfigurationService,
    private readonly monthsService: MonthsService,
  ) {}

  async getOverview(year?: number) {
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
    const currentChecking = toNumber(accountRow?.checkingBalance);
    const currentInvestment = toNumber(accountRow?.investmentBalance);
    const plans = await this.prisma.installmentPlan.findMany();

    let xChecking = currentChecking;
    let xInvestment = currentInvestment;
    let yChecking = currentChecking;
    let yInvestment = currentInvestment;
    const firstSimulationMonth = addMonths(toMonthStart(year, startMonth), 2);

    const rows = Array.from({ length: dto.monthsToSimulate }, (_, index) => {
      const simulationDate = addMonths(firstSimulationMonth, index);
      const existingInstallments = roundCurrency(
        plans
          .filter(
            (plan) =>
              plan.firstInstallmentMonth <= simulationDate && plan.lastInstallmentMonth >= simulationDate,
          )
          .reduce((sum, plan) => sum + toNumber(plan.monthlyAmount), 0),
      );

      xChecking = roundCurrency(
        xChecking + dto.salaryMonthly - dto.fixedMonthlyExpense - dto.variableMonthlyExpense - existingInstallments - dto.investmentX,
      );
      xInvestment = roundCurrency(xInvestment * (1 + dto.monthlyReturnRate) + dto.investmentX);

      yChecking = roundCurrency(
        yChecking + dto.salaryMonthly - dto.fixedMonthlyExpense - dto.variableMonthlyExpense - existingInstallments - dto.investmentY,
      );
      yInvestment = roundCurrency(yInvestment * (1 + dto.monthlyReturnRate) + dto.investmentY);

      const purchaseInstallment =
        dto.purchaseMode === 'installment'
          ? index + 1 >= dto.purchaseStartMonthIndex &&
            index + 1 < dto.purchaseStartMonthIndex + dto.purchaseInstallmentCount
            ? roundCurrency(dto.purchaseValue / dto.purchaseInstallmentCount)
            : 0
          : index + 1 === dto.purchaseStartMonthIndex
            ? dto.purchaseValue
            : 0;

      const xCheckingWithPurchase = roundCurrency(xChecking - purchaseInstallment);

      return {
        monthIndex: index + 1,
        date: simulationDate,
        existingInstallments,
        xCheckingWithoutPurchase: xChecking,
        xInvestmentBalance: xInvestment,
        xNetWorthWithoutPurchase: roundCurrency(xChecking + xInvestment),
        yCheckingWithoutPurchase: yChecking,
        yInvestmentBalance: yInvestment,
        yNetWorthWithoutPurchase: roundCurrency(yChecking + yInvestment),
        purchaseInstallment,
        xCheckingWithPurchase,
        xNetWorthWithPurchase: roundCurrency(xCheckingWithPurchase + xInvestment),
      };
    });

    return {
      startMonth,
      baseCheckingBalance: currentChecking,
      baseInvestmentBalance: currentInvestment,
      rows,
    };
  }

  private async getDashboard(year: number) {
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
          .filter(
            (item) => item.month === month && item.fixedExpenseTemplate.categoryId === category.id,
          )
          .reduce((sum, item) => sum + toNumber(item.paidAmount), 0);
        const variableTotal = variableExpenses
          .filter((item) => item.month === month && item.categoryId === category.id)
          .reduce((sum, item) => sum + toNumber(item.amount), 0);

        return roundCurrency(fixedTotal + variableTotal);
      });

      return {
        categoryId: category.id,
        categoryName: category.name,
        type: category.type,
        monthlyTotals,
        totalYear: roundCurrency(monthlyTotals.reduce((sum, value) => sum + value, 0)),
      };
    });
  }
}