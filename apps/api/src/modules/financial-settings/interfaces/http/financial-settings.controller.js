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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialSettingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const financial_settings_service_1 = require("../../application/financial-settings.service");
const start_date_preview_dto_1 = require("./dto/start-date-preview.dto");
const upsert_financial_settings_dto_1 = require("./dto/upsert-financial-settings.dto");
let FinancialSettingsController = class FinancialSettingsController {
    constructor(financialSettingsService) {
        this.financialSettingsService = financialSettingsService;
    }
    async getCurrent() {
        return this.financialSettingsService.getCurrent();
    }
    async upsert(dto) {
        return this.financialSettingsService.upsert(dto);
    }
    async preview(dto) {
        return this.financialSettingsService.previewStartDate(dto);
    }
};
exports.FinancialSettingsController = FinancialSettingsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOkResponse)({ type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinancialSettingsController.prototype, "getCurrent", null);
__decorate([
    (0, common_1.Put)(),
    (0, swagger_1.ApiBody)({ type: upsert_financial_settings_dto_1.UpsertFinancialSettingsDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upsert_financial_settings_dto_1.UpsertFinancialSettingsDto]),
    __metadata("design:returntype", Promise)
], FinancialSettingsController.prototype, "upsert", null);
__decorate([
    (0, common_1.Post)('/start-date-preview'),
    (0, swagger_1.ApiBody)({ type: start_date_preview_dto_1.StartDatePreviewDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [start_date_preview_dto_1.StartDatePreviewDto]),
    __metadata("design:returntype", Promise)
], FinancialSettingsController.prototype, "preview", null);
exports.FinancialSettingsController = FinancialSettingsController = __decorate([
    (0, swagger_1.ApiTags)('Financial Settings'),
    (0, common_1.Controller)('/financial-settings'),
    __param(0, (0, common_1.Inject)(financial_settings_service_1.FinancialSettingsService)),
    __metadata("design:paramtypes", [financial_settings_service_1.FinancialSettingsService])
], FinancialSettingsController);
