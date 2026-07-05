import { Module } from '@nestjs/common';
import { ExpirationService } from './expiration.service';

@Module({
  providers: [ExpirationService],
})
export class ExpirationModule {}
