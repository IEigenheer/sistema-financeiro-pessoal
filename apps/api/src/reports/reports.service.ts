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
    const extraEntries = dto.extraEntries ?? [];
    const firstSimulationMonth = addMonths(toMonthStart(year, startMonth), 1);

    const months = Array.from({ length: dto.monthsToSimulate }, (_, index) => {
      const simulationDate = addMonths(firstSimulationMonth, index);
      const monthIndex = index + 1;
      const existingInstallments = roundCurrency(
        plans
          .filter(
            (plan) =>
              plan.firstInstallmentMonth <= simulationDate && plan.lastInstallmentMonth >= simulationDate,
          )
          .reduce((sum, plan) => sum + toNumber(plan.monthlyAmount), 0),
      );
      const purchaseInstallment =
        dto.purchaseMode === 'installment'
          ? monthIndex >= dto.purchaseStartMonthIndex &&
            monthIndex < dto.purchaseStartMonthIndex + dto.purchaseInstallmentCount
            ? roundCurrency(dto.purchaseValue / dto.purchaseInstallmentCount)
            : 0
          : monthIndex === dto.purchaseStartMonthIndex
            ? dto.purchaseValue
            : 0;
      const baseExtra = roundCurrency(
        extraEntries
          .filter((item) => item.monthIndex === monthIndex && (item.scenario === 'both' || item.scenario === 'base'))
          .reduce((sum, item) => sum + toNumber(item.amount), 0),
      );
      const comparisonExtra = roundCurrency(
        extraEntries
          .filter((item) => item.monthIndex === monthIndex && (item.scenario === 'both' || item.scenario === 'comparison'))
          .reduce((sum, item) => sum + toNumber(item.amount), 0),
      );

      return {
        monthIndex,
        date: simulationDate,
        existingInstallments,
        purchaseInstallment,
        baseExtra,
        comparisonExtra,
      };
    });

    const runSeries = (monthlyInvestment, scenarioKey, options) => {
      let checking = currentChecking;
      let investment = currentInvestment;

      return months.map((month) => {
        const extraIncome = options.includeExtraEntries
          ? scenarioKey === 'base'
            ? month.baseExtra
            : month.comparisonExtra
          : 0;
        const purchaseCost = options.includePurchase ? month.purchaseInstallment : 0;

        checking = roundCurrency(
          checking +
            dto.salaryMonthly +
            extraIncome -
            dto.fixedMonthlyExpense -
            dto.variableMonthlyExpense -
            month.existingInstallments -
            monthlyInvestment -
            purchaseCost,
        );
        investment = roundCurrency(investment * (1 + dto.monthlyReturnRate) + monthlyInvestment);

        return {
          checking,
          investment,
          wealth: roundCurrency(checking + investment),
          metric: dto.investmentOnly ? investment : roundCurrency(checking + investment),
          purchaseCost,
          extraIncome,
        };
      });
    };

    const baseBaseline = runSeries(dto.baseMonthlyInvestment, 'base', {
      includePurchase: false,
      includeExtraEntries: false,
    });
    const comparisonBaseline = runSeries(dto.comparisonMonthlyInvestment, 'comparison', {
      includePurchase: false,
      includeExtraEntries: false,
    });
    const basePurchase = runSeries(dto.baseMonthlyInvestment, 'base', {
      includePurchase: true,
      includeExtraEntries: false,
    });
    const comparisonPurchase = runSeries(dto.comparisonMonthlyInvestment, 'comparison', {
      includePurchase: true,
      includeExtraEntries: false,
    });
    const baseExtras = runSeries(dto.baseMonthlyInvestment, 'base', {
      includePurchase: false,
      includeExtraEntries: true,
    });
    const comparisonExtras = runSeries(dto.comparisonMonthlyInvestment, 'comparison', {
      includePurchase: false,
      includeExtraEntries: true,
    });
    const baseFull = runSeries(dto.baseMonthlyInvestment, 'base', {
      includePurchase: true,
      includeExtraEntries: true,
    });
    const comparisonFull = runSeries(dto.comparisonMonthlyInvestment, 'comparison', {
      includePurchase: true,
      includeExtraEntries: true,
    });

    const rows = months.map((month, index) => ({
      monthIndex: month.monthIndex,
      date: month.date,
      existingInstallments: month.existingInstallments,
      purchaseInstallment: month.purchaseInstallment,
      baseExtra: month.baseExtra,
      comparisonExtra: month.comparisonExtra,
      base: {
        baseline: baseBaseline[index],
        purchase: basePurchase[index],
        extras: baseExtras[index],
        full: baseFull[index],
      },
      comparison: {
        baseline: comparisonBaseline[index],
        purchase: comparisonPurchase[index],
        extras: comparisonExtras[index],
        full: comparisonFull[index],
      },
    }));

    return {
      startMonth,
      firstSimulationMonth,
      baseCheckingBalance: currentChecking,
      baseInvestmentBalance: currentInvestment,
      investmentOnly: Boolean(dto.investmentOnly),
      rows,
    };
  }

  private async getDashboard(year: number) {
    const [categories, fixedStatuses, variableExpenses, installments, settings] = await Promise.all([
      this.prisma.category.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.monthlyFixedExpenseStatus.findMany({
        where: { year, status: 'PAID' },
        include: { fixedExpenseTemplate: true },
      }),
      this.prisma.variableExpense.findMany({ where: { year } }),
      this.prisma.installmentPlan.findMany(),
      this.configurationService.getSettings(),
    ]);

    const startMonth = settings.controlStartDate.getUTCMonth() + 1;

    return categories.map((category) => {
      const monthlyWithoutInstallments = Array.from({ length: 12 }, (_, index) => {
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

      const monthlyInstallments = Array.from({ length: 12 }, (_, index) => {
        const month = index + 1;
        if (month < startMonth) {
          return 0;
        }

        const monthDate = toMonthStart(year, month);
        const instTotal = installments
          .filter(
            (item) =>
              item.categoryId === category.id &&
              item.firstInstallmentMonth <= monthDate &&
              item.lastInstallmentMonth >= monthDate,
          )
          .reduce((sum, item) => sum + toNumber(item.monthlyAmount), 0);

        return roundCurrency(instTotal);
      });

      const monthlyTotals = monthlyWithoutInstallments.map((val, idx) =>
        roundCurrency(val + monthlyInstallments[idx]),
      );

      const totalYear = roundCurrency(monthlyTotals.reduce((sum, value) => sum + value, 0));
      const totalYearWithoutInstallments = roundCurrency(
        monthlyWithoutInstallments.reduce((sum, value) => sum + value, 0),
      );
      const totalYearInstallments = roundCurrency(
        monthlyInstallments.reduce((sum, value) => sum + value, 0),
      );

      return {
        categoryId: category.id,
        categoryName: category.name,
        type: category.type,
        monthlyTotals,
        monthlyWithoutInstallments,
        monthlyInstallments,
        totalYear,
        totalYearWithoutInstallments,
        totalYearInstallments,
      };
    });
  }
}