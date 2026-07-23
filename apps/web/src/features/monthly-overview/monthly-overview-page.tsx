import type { MonthlyOverview } from '@finance/contracts';

import { MonthlyOverviewCard } from './monthly-overview-card';

export function MonthlyOverviewPage({ overview }: { overview: MonthlyOverview }) {
  return <MonthlyOverviewCard overview={overview} />;
}
