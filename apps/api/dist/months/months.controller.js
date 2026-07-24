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
exports.MonthsController = void 0;
const common_1 = require("@nestjs/common");
const months_service_1 = require("./months.service");
const create_income_dto_1 = require("./dto/create-income.dto");
const create_variable_expense_dto_1 = require("./dto/create-variable-expense.dto");
const update_fixed_expense_status_dto_1 = require("./dto/update-fixed-expense-status.dto");
const update_adjustment_dto_1 = require("./dto/update-adjustment.dto");
let MonthsController = class MonthsController {
    monthsService;
    constructor(monthsService) {
        this.monthsService = monthsService;
    }
    getMonth(year, month) {
        return this.monthsService.getMonth(year, month);
    }
    createIncome(year, month, dto) {
        return this.monthsService.createIncome(year, month, dto);
    }
    createVariableExpense(year, month, dto) {
        return this.monthsService.createVariableExpense(year, month, dto);
    }
    updateFixedExpenseStatus(year, month, templateId, dto) {
        return this.monthsService.updateFixedExpenseStatus(year, month, templateId, dto);
    }
    updateAdjustment(year, month, dto) {
        return this.monthsService.updateAdjustment(year, month, dto);
    }
};
exports.MonthsController = MonthsController;
__decorate([
    (0, common_1.Get)(':year/:month'),
    __param(0, (0, common_1.Param)('year', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('month', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], MonthsController.prototype, "getMonth", null);
__decorate([
    (0, common_1.Post)(':year/:month/incomes'),
    __param(0, (0, common_1.Param)('year', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('month', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, create_income_dto_1.CreateIncomeDto]),
    __metadata("design:returntype", void 0)
], MonthsController.prototype, "createIncome", null);
__decorate([
    (0, common_1.Post)(':year/:month/variable-expenses'),
    __param(0, (0, common_1.Param)('year', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('month', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, create_variable_expense_dto_1.CreateVariableExpenseDto]),
    __metadata("design:returntype", void 0)
], MonthsController.prototype, "createVariableExpense", null);
__decorate([
    (0, common_1.Put)(':year/:month/fixed-expenses/:templateId'),
    __param(0, (0, common_1.Param)('year', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('month', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('templateId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, update_fixed_expense_status_dto_1.UpdateFixedExpenseStatusDto]),
    __metadata("design:returntype", void 0)
], MonthsController.prototype, "updateFixedExpenseStatus", null);
__decorate([
    (0, common_1.Put)(':year/:month/adjustments'),
    __param(0, (0, common_1.Param)('year', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('month', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, update_adjustment_dto_1.UpdateAdjustmentDto]),
    __metadata("design:returntype", void 0)
], MonthsController.prototype, "updateAdjustment", null);
exports.MonthsController = MonthsController = __decorate([
    (0, common_1.Controller)('months'),
    __metadata("design:paramtypes", [months_service_1.MonthsService])
], MonthsController);
