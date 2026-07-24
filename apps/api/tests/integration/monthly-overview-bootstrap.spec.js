"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const monthly_overview_controller_1 = require("../../src/modules/monthly-overviews/interfaces/http/monthly-overview.controller");
(0, vitest_1.describe)('monthly overview bootstrap', () => {
    (0, vitest_1.it)('exposes the minimum overview endpoint', async () => {
        const monthlyOverviewService = {
            getMonthlyOverview: vitest_1.vi.fn().mockResolvedValue({
                month: '2026-07-01',
                withinControlPeriod: true,
                openingOperationalBalance: '2500.00',
                openingInvestmentBalance: '10000.00',
                plannedSalaryInstallments: [],
                plannedIncome: '8500.00',
                realizedIncome: '0.00',
                plannedFixedExpenses: '0.00',
                realizedExpenses: '0.00',
                variableExpenses: '0.00',
                installments: '0.00',
                contributions: '0.00',
                yields: '0.00',
                operationalBalance: '11000.00',
                investmentBalance: '10000.00',
                plannedVsRealizedDelta: '0.00',
            }),
        };
        const controller = new monthly_overview_controller_1.MonthlyOverviewController(monthlyOverviewService);
        await (0, vitest_1.expect)(controller.getOverview('2026-07-01')).resolves.toMatchObject({ month: '2026-07-01' });
    });
});
