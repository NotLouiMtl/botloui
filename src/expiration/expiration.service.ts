import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpirationService {
  private readonly logger = new Logger(ExpirationService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async liberarExpirados() {
    const now = new Date();
    const expirados = await this.prisma.purchase.findMany({
      where: { expiresAt: { lte: now }, status: 'completed' },
      include: { profile: true, account: true },
    });

    for (const purchase of expirados) {
      await this.prisma.$transaction(async (tx) => {
        await tx.purchase.update({
          where: { id: purchase.id },
          data: { status: 'expired' },
        });
        if (purchase.profile) {
          await tx.profile.update({
            where: { id: purchase.profile.id },
            data: { isOccupied: false, assignedToId: null, assignedAt: null },
          });
        }
        if (purchase.account) {
          await tx.account.update({
            where: { id: purchase.account.id },
            data: { isOccupied: false, assignedToId: null, assignedAt: null },
          });
        }
      });
    }

    if (expirados.length > 0) {
      this.logger.log(`Liberados ${expirados.length} items expirados`);
    }
  }
}
