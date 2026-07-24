import { MonthlyOverviewPage } from '../../../features/monthly-overview/monthly-overview-page';
import { createApiClient } from '../../../lib/api/client';

export default async function Page() {
  const api = createApiClient();
  try {
    const overview = await api.getMonthlyOverview('2026-07-01');
    return <MonthlyOverviewPage overview={overview} />;
  } catch {
    return <MonthlyOverviewPage overview={{
      month: '2026-07-01',
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
    }} />;
  }
}
