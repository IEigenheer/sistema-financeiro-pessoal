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
exports.FixedExpensesController = void 0;
const common_1 = require("@nestjs/common");
const fixed_expenses_service_1 = require("./fixed-expenses.service");
const upsert_fixed_expense_dto_1 = require("./dto/upsert-fixed-expense.dto");
let FixedExpensesController = class FixedExpensesController {
    fixedExpensesService;
    constructor(fixedExpensesService) {
        this.fixedExpensesService = fixedExpensesService;
    }
    list() {
        return this.fixedExpensesService.list();
    }
    create(dto) {
        return this.fixedExpensesService.create(dto);
    }
    update(id, dto) {
        return this.fixedExpensesService.update(id, dto);
    }
};
exports.FixedExpensesController = FixedExpensesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FixedExpensesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upsert_fixed_expense_dto_1.UpsertFixedExpenseDto]),
    __metadata("design:returntype", void 0)
], FixedExpensesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_fixed_expense_dto_1.UpsertFixedExpenseDto]),
    __metadata("design:returntype", void 0)
], FixedExpensesController.prototype, "update", null);
exports.FixedExpensesController = FixedExpensesController = __decorate([
    (0, common_1.Controller)('fixed-expenses'),
    __metadata("design:paramtypes", [fixed_expenses_service_1.FixedExpensesService])
], FixedExpensesController);
