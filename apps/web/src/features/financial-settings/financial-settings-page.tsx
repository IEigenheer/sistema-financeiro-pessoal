'use client';

import type { FinancialSettings } from '@finance/contracts';

import { FinancialSettingsForm } from './financial-settings-form';

export function FinancialSettingsPage({ initialValues }: { initialValues: FinancialSettings | null }) {
  return (
    <section>
      <h1>Configurações financeiras</h1>
      <FinancialSettingsForm initialValues={initialValues} />
    </section>
  );
}
