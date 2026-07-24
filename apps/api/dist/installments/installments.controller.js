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
exports.InstallmentsController = void 0;
const common_1 = require("@nestjs/common");
const installments_service_1 = require("./installments.service");
const upsert_installment_dto_1 = require("./dto/upsert-installment.dto");
let InstallmentsController = class InstallmentsController {
    installmentsService;
    constructor(installmentsService) {
        this.installmentsService = installmentsService;
    }
    list() {
        return this.installmentsService.list();
    }
    create(dto) {
        return this.installmentsService.create(dto);
    }
    update(id, dto) {
        return this.installmentsService.update(id, dto);
    }
};
exports.InstallmentsController = InstallmentsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upsert_installment_dto_1.UpsertInstallmentDto]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_installment_dto_1.UpsertInstallmentDto]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "update", null);
exports.InstallmentsController = InstallmentsController = __decorate([
    (0, common_1.Controller)('installments'),
    __metadata("design:paramtypes", [installments_service_1.InstallmentsService])
], InstallmentsController);
