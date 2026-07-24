import { Category as CategoryContract, CreateCategoryRequest, UpdateCategoryRequest } from '@finance/contracts';
import { PrismaService } from '../../../common/database/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
export declare class CategoryService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    list(): Promise<CategoryContract[]>;
    create(input: CreateCategoryRequest): Promise<CategoryContract>;
    update(id: string, input: UpdateCategoryRequest): Promise<CategoryContract>;
    private normalizeName;
    private toContract;
}
