import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreate(telegramId: bigint, username?: string) {
    let user = await this.prisma.user.findUnique({ where: { telegramId } });
    if (!user) {
      user = await this.prisma.user.create({ data: { telegramId, username } });
    }
    return user;
  }

  async getSaldo(telegramId: bigint) {
    const user = await this.prisma.user.findUnique({ where: { telegramId } });
    return user?.saldo ?? 0;
  }

  async findByTelegramId(telegramId: bigint) {
    return this.prisma.user.findUnique({ where: { telegramId } });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
