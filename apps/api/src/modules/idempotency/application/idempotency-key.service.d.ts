import { PrismaService } from '../../../common/database/prisma.service';
export declare class IdempotencyKeyService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByKey(key: string): Promise<{
        id: string;
        createdAt: Date;
        key: string;
        requestHash: string;
        responseStatus: number | null;
        responseBody: import("@prisma/client/runtime/client").JsonValue | null;
        expiresAt: Date;
    } | null>;
}
