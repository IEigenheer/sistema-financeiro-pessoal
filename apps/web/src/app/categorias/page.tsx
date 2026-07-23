import { CategoriesPage } from '../../features/categories/categories-page';
import { createApiClient } from '../../lib/api/client';

export default async function Page() {
  const api = createApiClient();
  try {
    const initialCategories = await api.listCategories();
    return <CategoriesPage initialCategories={initialCategories} />;
  } catch {
    return <CategoriesPage initialCategories={[]} />;
  }
}
