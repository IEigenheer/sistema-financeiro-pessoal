import { Category as CategoryContract, CreateCategoryRequest, UpdateCategoryRequest } from '@finance/contracts';
import { Injectable } from '@nestjs/common';


import { PrismaService } from '../../../common/database/prisma.service';
import { AuditService } from '../../audit/application/audit.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService, private readonly auditService: AuditService) {}

  async list(): Promise<CategoryContract[]> {
    const categories = await this.prisma.category.findMany({ orderBy: { name: 'asc' } });
    return categories.map((category) => this.toContract(category));
  }

  async create(input: CreateCategoryRequest): Promise<CategoryContract> {
    const created = await this.prisma.category.create({
      data: {
        name: input.name.trim(),
        normalizedName: this.normalizeName(input.name),
      },
    });

    await this.auditService.record({
      entityName: 'CATEGORY',
      entityId: created.id,
      operation: 'CREATE',
      changeOrigin: 'LOCAL_USER',
      previousValues: null,
      nextValues: created,
    });

    return this.toContract(created);
  }

  async update(id: string, input: UpdateCategoryRequest): Promise<CategoryContract> {
    const previous = await this.prisma.category.findUniqueOrThrow({ where: { id } });
    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name.trim(), normalizedName: this.normalizeName(input.name) } : {}),
        ...(typeof input.isActive === 'boolean' ? { isActive: input.isActive } : {}),
      },
    });

    await this.auditService.record({
      entityName: 'CATEGORY',
      entityId: updated.id,
      operation: 'UPDATE',
      changeOrigin: 'LOCAL_USER',
      previousValues: previous,
      nextValues: updated,
    });

    return this.toContract(updated);
  }

  private normalizeName(value: string): string {
    return value.trim().toLocaleLowerCase('pt-BR');
  }

  private toContract(category: { id: string; name: string; isActive: boolean }): CategoryContract {
    return {
      id: category.id,
      name: category.name,
      isActive: category.isActive,
    };
  }
}
