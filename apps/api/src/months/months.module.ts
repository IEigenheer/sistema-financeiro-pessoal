import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { MonthsController } from './months.controller';
import { MonthsService } from './months.service';

@Module({
  imports: [ConfigurationModule],
  controllers: [MonthsController],
  providers: [MonthsService],
  exports: [MonthsService],
})
export class MonthsModule {}
