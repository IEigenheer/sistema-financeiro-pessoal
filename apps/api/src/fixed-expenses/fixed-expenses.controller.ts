import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { FixedExpensesService } from './fixed-expenses.service';
import { UpsertFixedExpenseDto } from './dto/upsert-fixed-expense.dto';

@Controller('fixed-expenses')
export class FixedExpensesController {
  constructor(private readonly fixedExpensesService: FixedExpensesService) {}

  @Get()
  list() {
    return this.fixedExpensesService.list();
  }

  @Post()
  create(@Body() dto: UpsertFixedExpenseDto) {
    return this.fixedExpensesService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpsertFixedExpenseDto) {
    return this.fixedExpensesService.update(id, dto);
  }
}
