import { FinancialSettingsPage } from '../../features/financial-settings/financial-settings-page';
import { createApiClient } from '../../lib/api/client';

export default async function Page() {
  const api = createApiClient();
  try {
    const initialValues = await api.getFinancialSettings();
    return <FinancialSettingsPage initialValues={initialValues} />;
  } catch {
    return <FinancialSettingsPage initialValues={null} />;
  }
}
