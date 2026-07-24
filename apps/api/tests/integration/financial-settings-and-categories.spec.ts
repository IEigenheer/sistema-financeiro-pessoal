import { describe, expect, it, vi } from 'vitest';

import { CategoriesController } from '../../src/modules/categories/interfaces/http/categories.controller';
import { FinancialSettingsController } from '../../src/modules/financial-settings/interfaces/http/financial-settings.controller';

describe('financial settings and categories wiring', () => {
  it('exposes the US1 controllers', async () => {
    const financialSettingsService = {
      getCurrent: vi.fn().mockResolvedValue(null),
      upsert: vi.fn(),
      previewStartDate: vi.fn(),
    };
    const categoryService = {
      list: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
    };

    const financialSettingsController = new FinancialSettingsController(financialSettingsService as never);
    const categoriesController = new CategoriesController(categoryService as never);

    await expect(financialSettingsController.getCurrent()).resolves.toBeNull();
    expect(financialSettingsController).toBeDefined();
    expect(categoriesController).toBeDefined();
  });
});
