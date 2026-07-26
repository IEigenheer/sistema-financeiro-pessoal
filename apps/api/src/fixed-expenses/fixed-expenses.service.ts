import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertFixedExpenseDto } from './dto/upsert-fixed-expense.dto';

@Injectable()
export class FixedExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.fixedExpenseTemplate.findMany({
      include: { category: true },
      orderBy: { description: 'asc' },
    });
  }

  create(dto: UpsertFixedExpenseDto) {
    return this.prisma.fixedExpenseTemplate.create({
      data: dto,
    });
  }

  update(id: string, dto: UpsertFixedExpenseDto) {
    return this.prisma.fixedExpenseTemplate.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: string) {
    return this.prisma.fixedExpenseTemplate.delete({
      where: { id },
    });
  }
}
