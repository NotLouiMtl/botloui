import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { UsersModule } from '../users/users.module';
import { PurchasesModule } from '../purchases/purchases.module';

@Module({
  imports: [UsersModule, PurchasesModule],
  providers: [BotService],
})
export class BotModule {}
