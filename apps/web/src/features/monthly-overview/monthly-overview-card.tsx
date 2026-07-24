import type { MonthlyOverview } from '@finance/contracts';

import { formatMoney } from '../../lib/formatters/money';

export function MonthlyOverviewCard({ overview }: { overview: MonthlyOverview }) {
  return (
    <section>
      <h1>Overview de {overview.month}</h1>
      <p>{overview.withinControlPeriod ? 'Dentro do período de controle' : 'Fora do período de controle'}</p>
      <dl>
        <dt>Receitas previstas</dt>
        <dd>{formatMoney(overview.plannedIncome)}</dd>
        <dt>Saldo operacional</dt>
        <dd>{formatMoney(overview.operationalBalance)}</dd>
        <dt>Saldo de investimentos</dt>
        <dd>{formatMoney(overview.investmentBalance)}</dd>
      </dl>
      <ul>
        {overview.plannedSalaryInstallments.map((installment) => (
          <li key={installment.installmentLabel}>
            {installment.installmentLabel}: {installment.plannedDate} - {formatMoney(installment.plannedAmount)}
          </li>
        ))}
      </ul>
    </section>
  );
}
