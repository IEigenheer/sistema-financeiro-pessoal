import { Module } from '@nestjs/common';

import { IdempotencyKeyService } from './application/idempotency-key.service';

@Module({
  providers: [IdempotencyKeyService],
  exports: [IdempotencyKeyService],
})
export class IdempotencyModule {}
