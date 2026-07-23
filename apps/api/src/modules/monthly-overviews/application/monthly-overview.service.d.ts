import { MonthlyOverview as MonthlyOverviewContract } from '@finance/contracts';
import { PrismaService } from '../../../common/database/prisma.service';
export declare class MonthlyOverviewService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMonthlyOverview(month: string): Promise<MonthlyOverviewContract>;
    private toMaterializedRow;
    private emptyOverview;
    private toSnapshot;
}
