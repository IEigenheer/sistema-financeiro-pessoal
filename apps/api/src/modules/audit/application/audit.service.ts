import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/database/prisma.service';

export interface AuditRecordInput {
  entityName: string;
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'CANCEL' | 'MATERIALIZE';
  changeOrigin: 'LOCAL_USER' | 'SYSTEM';
  previousValues: unknown;
  nextValues: unknown;
}

function toJsonValue(value: unknown): unknown {
  return value === undefined ? null : JSON.parse(JSON.stringify(value));
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: AuditRecordInput): Promise<void> {
    await this.prisma.auditEvent.create({
      data: {
        entityName: input.entityName,
        entityId: input.entityId,
        operation: input.operation,
        changeOrigin: input.changeOrigin,
        previousValues: toJsonValue(input.previousValues) as never,
        nextValues: toJsonValue(input.nextValues) as never,
      },
    });
  }
}
