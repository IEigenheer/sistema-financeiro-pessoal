import { FinancialSettings as FinancialSettingsContract } from '@finance/contracts';
import { FinancialSettingsService } from '../../application/financial-settings.service';
import { StartDatePreviewDto } from './dto/start-date-preview.dto';
import { UpsertFinancialSettingsDto } from './dto/upsert-financial-settings.dto';
export declare class FinancialSettingsController {
    private readonly financialSettingsService;
    constructor(financialSettingsService: FinancialSettingsService);
    getCurrent(): Promise<FinancialSettingsContract | null>;
    upsert(dto: UpsertFinancialSettingsDto): Promise<FinancialSettingsContract>;
    preview(dto: StartDatePreviewDto): Promise<import("@finance/contracts").ChangeImpactPreview>;
}
