import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { InstallmentsService } from './installments.service';
import { UpsertInstallmentDto } from './dto/upsert-installment.dto';

@Controller('installments')
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  @Get()
  list() {
    return this.installmentsService.list();
  }

  @Post()
  create(@Body() dto: UpsertInstallmentDto) {
    return this.installmentsService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpsertInstallmentDto) {
    return this.installmentsService.update(id, dto);
  }
}
