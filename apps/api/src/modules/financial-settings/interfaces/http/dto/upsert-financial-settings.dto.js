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
exports.UpsertFinancialSettingsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const MONEY_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d{2})?$/;
const SECOND_INSTALLMENT_RULES = ['LAST_DAY_OF_MONTH'];
class UpsertFinancialSettingsDto {
}
exports.UpsertFinancialSettingsDto = UpsertFinancialSettingsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-01-01', format: 'date' }),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/),
    __metadata("design:type", String)
], UpsertFinancialSettingsDto.prototype, "controlStartDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '8500.00' }),
    (0, class_validator_1.Matches)(MONEY_PATTERN),
    __metadata("design:type", String)
], UpsertFinancialSettingsDto.prototype, "monthlyNetSalary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '3000.00' }),
    (0, class_validator_1.Matches)(MONEY_PATTERN),
    __metadata("design:type", String)
], UpsertFinancialSettingsDto.prototype, "firstSalaryInstallmentAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15, minimum: 1, maximum: 31 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(31),
    __metadata("design:type", Number)
], UpsertFinancialSettingsDto.prototype, "firstSalaryInstallmentDay", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0.00800000' }),
    (0, class_validator_1.Matches)(/^(?:0|[1-9]\d*)(?:\.\d{1,8})?$/),
    __metadata("design:type", String)
], UpsertFinancialSettingsDto.prototype, "projectedMonthlyInvestmentYieldRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2500.00' }),
    (0, class_validator_1.Matches)(MONEY_PATTERN),
    __metadata("design:type", String)
], UpsertFinancialSettingsDto.prototype, "defaultMonthlyContribution", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2500.00' }),
    (0, class_validator_1.Matches)(MONEY_PATTERN),
    __metadata("design:type", String)
], UpsertFinancialSettingsDto.prototype, "initialOperationalBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '10000.00' }),
    (0, class_validator_1.Matches)(MONEY_PATTERN),
    __metadata("design:type", String)
], UpsertFinancialSettingsDto.prototype, "initialInvestmentBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: SECOND_INSTALLMENT_RULES, example: 'LAST_DAY_OF_MONTH' }),
    (0, class_validator_1.IsIn)(SECOND_INSTALLMENT_RULES),
    __metadata("design:type", String)
], UpsertFinancialSettingsDto.prototype, "secondSalaryInstallmentDateRule", void 0);
