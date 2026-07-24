import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class ConfigurationService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    return this.prisma.appSettings.findUniqueOrThrow({
      where: { id: 1 },
    });
  }

  async updateSettings(dto: UpdateSettingsDto) {
    return this.prisma.appSettings.upsert({
      where: { id: 1 },
      update: {
        referenceYear: dto.referenceYear,
        currentMonthReference: new Date(dto.currentMonthReference),
        controlStartDate: new Date(dto.controlStartDate),
        salaryNetTotal: dto.salaryNetTotal,
        salaryFirstInstallment: dto.salaryFirstInstallment,
        salarySecondInstallment: dto.salarySecondInstallment,
        salaryFirstInstallmentDay: dto.salaryFirstInstallmentDay,
        monthlyInvestmentContribution: dto.monthlyInvestmentContribution,
        projectedMonthlyReturnRate: dto.projectedMonthlyReturnRate,
        initialCheckingBalance: dto.initialCheckingBalance,
        initialInvestmentBalance: dto.initialInvestmentBalance,
      },
      create: {
        id: 1,
        referenceYear: dto.referenceYear,
        currentMonthReference: new Date(dto.currentMonthReference),
        controlStartDate: new Date(dto.controlStartDate),
        salaryNetTotal: dto.salaryNetTotal,
        salaryFirstInstallment: dto.salaryFirstInstallment,
        salarySecondInstallment: dto.salarySecondInstallment,
        salaryFirstInstallmentDay: dto.salaryFirstInstallmentDay,
        monthlyInvestmentContribution: dto.monthlyInvestmentContribution,
        projectedMonthlyReturnRate: dto.projectedMonthlyReturnRate,
        initialCheckingBalance: dto.initialCheckingBalance,
        initialInvestmentBalance: dto.initialInvestmentBalance,
      },
    });
  }
}
