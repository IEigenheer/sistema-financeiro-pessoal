"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const categories_controller_1 = require("../../src/modules/categories/interfaces/http/categories.controller");
const financial_settings_controller_1 = require("../../src/modules/financial-settings/interfaces/http/financial-settings.controller");
(0, vitest_1.describe)('financial settings and categories wiring', () => {
    (0, vitest_1.it)('exposes the US1 controllers', async () => {
        const financialSettingsService = {
            getCurrent: vitest_1.vi.fn().mockResolvedValue(null),
            upsert: vitest_1.vi.fn(),
            previewStartDate: vitest_1.vi.fn(),
        };
        const categoryService = {
            list: vitest_1.vi.fn().mockResolvedValue([]),
            create: vitest_1.vi.fn(),
            update: vitest_1.vi.fn(),
        };
        const financialSettingsController = new financial_settings_controller_1.FinancialSettingsController(financialSettingsService);
        const categoriesController = new categories_controller_1.CategoriesController(categoryService);
        await (0, vitest_1.expect)(financialSettingsController.getCurrent()).resolves.toBeNull();
        (0, vitest_1.expect)(financialSettingsController).toBeDefined();
        (0, vitest_1.expect)(categoriesController).toBeDefined();
    });
});
