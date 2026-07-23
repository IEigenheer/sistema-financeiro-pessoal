import { MonthlyOverview as MonthlyOverviewContract } from '@finance/contracts';
import { MonthlyOverviewService } from '../../application/monthly-overview.service';
export declare class MonthlyOverviewController {
    private readonly monthlyOverviewService;
    constructor(monthlyOverviewService: MonthlyOverviewService);
    getOverview(month: string): Promise<MonthlyOverviewContract>;
}
