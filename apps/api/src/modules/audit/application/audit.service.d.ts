import { PrismaService } from '../../../common/database/prisma.service';
export interface AuditRecordInput {
    entityName: string;
    entityId: string;
    operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'CANCEL' | 'MATERIALIZE';
    changeOrigin: 'LOCAL_USER' | 'SYSTEM';
    previousValues: unknown;
    nextValues: unknown;
}
export declare class AuditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    record(input: AuditRecordInput): Promise<void>;
}
