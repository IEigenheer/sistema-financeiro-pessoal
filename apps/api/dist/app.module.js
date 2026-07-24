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
const prisma_module_1 = require("./prisma/prisma.module");
const configuration_module_1 = require("./configuration/configuration.module");
const categories_module_1 = require("./categories/categories.module");
const fixed_expenses_module_1 = require("./fixed-expenses/fixed-expenses.module");
const installments_module_1 = require("./installments/installments.module");
const months_module_1 = require("./months/months.module");
const reports_module_1 = require("./reports/reports.module");
const seed_service_1 = require("./seed/seed.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            configuration_module_1.ConfigurationModule,
            categories_module_1.CategoriesModule,
            fixed_expenses_module_1.FixedExpensesModule,
            installments_module_1.InstallmentsModule,
            months_module_1.MonthsModule,
            reports_module_1.ReportsModule,
        ],
        providers: [seed_service_1.SeedService],
    })
], AppModule);
