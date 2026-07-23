"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("./common/database/prisma.module");
const audit_module_1 = require("./modules/audit/audit.module");
const categories_module_1 = require("./modules/categories/categories.module");
const duplicate_check_module_1 = require("./modules/duplicate-check/duplicate-check.module");
const financial_settings_module_1 = require("./modules/financial-settings/financial-settings.module");
const health_controller_1 = require("./modules/health/health.controller");
const idempotency_module_1 = require("./modules/idempotency/idempotency.module");
const monthly_overviews_module_1 = require("./modules/monthly-overviews/monthly-overviews.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            audit_module_1.AuditModule,
            idempotency_module_1.IdempotencyModule,
            duplicate_check_module_1.DuplicateCheckModule,
            financial_settings_module_1.FinancialSettingsModule,
            categories_module_1.CategoriesModule,
            monthly_overviews_module_1.MonthlyOverviewsModule,
        ],
        controllers: [health_controller_1.HealthController],
    })
], AppModule);
