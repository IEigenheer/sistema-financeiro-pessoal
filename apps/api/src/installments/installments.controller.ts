import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.installmentsService.remove(id);
  }
}
