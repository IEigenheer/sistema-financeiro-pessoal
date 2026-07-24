"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ConfigurationService = class ConfigurationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSettings() {
        return this.prisma.appSettings.findUniqueOrThrow({
            where: { id: 1 },
        });
    }
    async updateSettings(dto) {
        return this.prisma.appSettings.upsert({
            where: { id: 1 },
            update: {
                referenceYear: dto.referenceYear,
                currentMonthReference: new Date(dto.currentMonthReference),
                controlStartDate: new Date(dto.controlStartDate),
                salaryNetTotal: dto.salaryNetTotal,
                salaryFirstInstallment: dto.salaryFirstInstallment,
                salarySecondInstallment: dto.salarySecondInstallment,
                salaryFirstInstallmentDay: dto.salaryFirstInstallmentDay,
                monthlyInvestmentContribution: dto.monthlyInvestmentContribution,
                projectedMonthlyReturnRate: dto.projectedMonthlyReturnRate,
                initialCheckingBalance: dto.initialCheckingBalance,
                initialInvestmentBalance: dto.initialInvestmentBalance,
            },
            create: {
                id: 1,
                referenceYear: dto.referenceYear,
                currentMonthReference: new Date(dto.currentMonthReference),
                controlStartDate: new Date(dto.controlStartDate),
                salaryNetTotal: dto.salaryNetTotal,
                salaryFirstInstallment: dto.salaryFirstInstallment,
                salarySecondInstallment: dto.salarySecondInstallment,
                salaryFirstInstallmentDay: dto.salaryFirstInstallmentDay,
                monthlyInvestmentContribution: dto.monthlyInvestmentContribution,
                projectedMonthlyReturnRate: dto.projectedMonthlyReturnRate,
                initialCheckingBalance: dto.initialCheckingBalance,
                initialInvestmentBalance: dto.initialInvestmentBalance,
            },
        });
    }
};
exports.ConfigurationService = ConfigurationService;
exports.ConfigurationService = ConfigurationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConfigurationService);
