import { ChangeImpactPreview, FinancialSettings as FinancialSettingsContract, StartDatePreviewRequest } from '@finance/contracts';
import { PrismaService } from '../../../common/database/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { StartDatePreviewDto } from '../interfaces/http/dto/start-date-preview.dto';
import { UpsertFinancialSettingsDto } from '../interfaces/http/dto/upsert-financial-settings.dto';
export declare class FinancialSettingsService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    getCurrent(): Promise<FinancialSettingsContract | null>;
    upsert(input: UpsertFinancialSettingsDto): Promise<FinancialSettingsContract>;
    previewStartDate(input: StartDatePreviewDto | StartDatePreviewRequest): Promise<ChangeImpactPreview>;
    private buildAffectedMonths;
    private toContract;
    private assertMoney;
}
