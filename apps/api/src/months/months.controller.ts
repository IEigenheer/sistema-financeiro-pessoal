import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { MonthsService } from './months.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { CreateVariableExpenseDto } from './dto/create-variable-expense.dto';
import { UpdateFixedExpenseStatusDto } from './dto/update-fixed-expense-status.dto';
import { UpdateAdjustmentDto } from './dto/update-adjustment.dto';

@Controller('months')
export class MonthsController {
  constructor(private readonly monthsService: MonthsService) {}

  @Get(':year/:month')
  getMonth(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return this.monthsService.getMonth(year, month);
  }

  @Post(':year/:month/incomes')
  createIncome(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Body() dto: CreateIncomeDto,
  ) {
    return this.monthsService.createIncome(year, month, dto);
  }

  @Post(':year/:month/variable-expenses')
  createVariableExpense(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Body() dto: CreateVariableExpenseDto,
  ) {
    return this.monthsService.createVariableExpense(year, month, dto);
  }

  @Put(':year/:month/fixed-expenses/:templateId')
  updateFixedExpenseStatus(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Param('templateId') templateId: string,
    @Body() dto: UpdateFixedExpenseStatusDto,
  ) {
    return this.monthsService.updateFixedExpenseStatus(year, month, templateId, dto);
  }

  @Put(':year/:month/adjustments')
  updateAdjustment(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Body() dto: UpdateAdjustmentDto,
  ) {
    return this.monthsService.updateAdjustment(year, month, dto);
  }
}
