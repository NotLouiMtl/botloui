import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAvailable(serviceId: number) {
    return this.prisma.profile.findMany({
      where: {
        account: { serviceId, status: 'active' },
        isOccupied: false,
      },
      include: { account: true },
    });
  }
}
