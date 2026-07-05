import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers() {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async addBalance(telegramId: string, amount: number) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { telegramId: BigInt(telegramId) } });
      if (!user) throw new NotFoundException('Usuario no encontrado');

      const newSaldo = Number(user.saldo) + amount;
      if (newSaldo < 0) throw new Error('El saldo no puede quedar negativo');

      await tx.user.update({
        where: { id: user.id },
        data: { saldo: { increment: amount } },
      });
      const type = amount >= 0 ? 'deposit' : 'withdrawal';
      const description = amount >= 0 ? 'Saldo agregado por admin' : 'Saldo removido por admin';
      await tx.transaction.create({
        data: { userId: user.id, type, amount, description },
      });
      return { ...user, saldo: newSaldo };
    });
  }

  async toggleBlockUser(telegramId: string) {
    const user = await this.prisma.user.findUnique({ where: { telegramId: BigInt(telegramId) } });
    if (!user) throw new Error('Usuario no encontrado');
    return this.prisma.user.update({
      where: { telegramId: BigInt(telegramId) },
      data: { isBlocked: !user.isBlocked },
    });
  }

  async createStock(serviceId: number, email: string, password: string, pin?: string, profiles = 5, profilePins?: string[]) {
    return this.prisma.$transaction(async (tx) => {
      const account = await tx.account.create({ data: { serviceId, email, password, pin } });
      const profileData = Array.from({ length: profiles }, (_, i) => ({
        accountId: account.id,
        profileNumber: i + 1,
        pin: profilePins && i < profilePins.length ? profilePins[i] || null : null,
      }));
      await tx.profile.createMany({ data: profileData });
      return { account, profilesCreated: profiles };
    });
  }

  async getStockSummary() {
    const byService = await this.prisma.service.findMany({
      include: {
        accounts: {
          include: {
            profiles: { where: { isOccupied: false } },
          },
        },
      },
    });

    const summary = byService.map((s) => ({
      id: s.id,
      name: s.name,
      accounts: s.accounts.length,
      available: s.accounts.reduce((sum, a) => sum + a.profiles.length, 0),
    }));

    const total = await this.prisma.profile.count();
    const available = await this.prisma.profile.count({ where: { isOccupied: false } });

    return { summary, total, available, sold: total - available };
  }

  async getStats() {
    const [totalUsers, totalSaldo, stock, todaySales] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.aggregate({ _sum: { saldo: true } }),
      this.prisma.profile.count({ where: { isOccupied: false } }),
      this.prisma.purchase.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
    ]);

    return {
      totalUsers,
      totalSaldo: totalSaldo._sum.saldo || 0,
      stockAvailable: stock,
      todaySales,
    };
  }

  async getServices() {
    return this.prisma.service.findMany({ orderBy: { id: 'asc' } });
  }

  async createService(name: string, price: number) {
    return this.prisma.service.create({ data: { name, price } });
  }

  async updateService(id: number, data: { price?: number; active?: boolean }) {
    return this.prisma.service.update({ where: { id }, data });
  }

  async getTransactions() {
    return this.prisma.transaction.findMany({
      include: { user: { select: { id: true, username: true, telegramId: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getUserPurchases(userId: number) {
    return this.prisma.purchase.findMany({
      where: { userId },
      include: { service: true, profile: { include: { account: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteService(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const profiles = await tx.profile.findMany({
        where: { account: { serviceId: id } },
        select: { id: true },
      });
      const profileIds = profiles.map((p) => p.id);
      await tx.purchase.deleteMany({ where: { profileId: { in: profileIds } } });
      const accounts = await tx.account.findMany({ where: { serviceId: id }, select: { id: true } });
      const accountIds = accounts.map((a) => a.id);
      await tx.profile.deleteMany({ where: { accountId: { in: accountIds } } });
      await tx.account.deleteMany({ where: { serviceId: id } });
      await tx.service.delete({ where: { id } });
      return { deleted: true };
    });
  }

  async setPassword(telegramId: string, password: string, adminUserId: number) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminUserId } });
    if (!admin || admin.role !== 'ADMIN') throw new ForbiddenException('Solo admins');

    const hashed = await bcrypt.hash(password, 10);
    return this.prisma.user.update({
      where: { telegramId: BigInt(telegramId) },
      data: { password: hashed },
      select: { id: true, telegramId: true, role: true },
    });
  }
}
