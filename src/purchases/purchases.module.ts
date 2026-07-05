import { Module } from '@nestjs/common';
import { PurchasesService } from './purchases.service';

@Module({
  providers: [PurchasesService],
  exports: [PurchasesService],
})
export class PurchasesModule {}
