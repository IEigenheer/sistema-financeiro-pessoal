import { test, expect } from '@playwright/test';

test('US1 basic flow is reachable', async ({ page }) => {
  await page.goto('/configuracoes');
  await expect(page.getByRole('heading', { name: 'Configurações financeiras' })).toBeVisible();
  await page.goto('/categorias');
  await expect(page.getByRole('heading', { name: 'Categorias' })).toBeVisible();
});
