import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertInstallmentDto } from './dto/upsert-installment.dto';

@Injectable()
export class InstallmentsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.installmentPlan.findMany({
      include: { category: true },
      orderBy: { firstInstallmentMonth: 'asc' },
    });
  }

  create(dto: UpsertInstallmentDto) {
    return this.prisma.installmentPlan.create({
      data: {
        ...dto,
        purchaseDate: new Date(dto.purchaseDate),
        firstInstallmentMonth: new Date(dto.firstInstallmentMonth),
        lastInstallmentMonth: new Date(dto.lastInstallmentMonth),
      },
    });
  }

  update(id: string, dto: UpsertInstallmentDto) {
    return this.prisma.installmentPlan.update({
      where: { id },
      data: {
        ...dto,
        purchaseDate: new Date(dto.purchaseDate),
        firstInstallmentMonth: new Date(dto.firstInstallmentMonth),
        lastInstallmentMonth: new Date(dto.lastInstallmentMonth),
      },
    });
  }
}
