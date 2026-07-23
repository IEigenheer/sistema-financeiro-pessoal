import { render } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import { MonthlyOverviewPage } from './monthly-overview-page';

describe('MonthlyOverviewPage', () => {
  it('renders the overview summary', () => {
    const view = render(
      createElement(MonthlyOverviewPage, {
        overview: {
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
        },
      }),
    );

    expect(view.getByText(/Overview de 2026-07-01/)).toBeInTheDocument();
  });
});
