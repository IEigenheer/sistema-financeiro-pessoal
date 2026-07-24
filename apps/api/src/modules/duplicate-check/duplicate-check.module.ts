import { Module } from '@nestjs/common';

import { DuplicateCheckService } from './application/duplicate-check.service';

@Module({
  providers: [DuplicateCheckService],
  exports: [DuplicateCheckService],
})
export class DuplicateCheckModule {}
