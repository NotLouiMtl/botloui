import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.service.findMany({ where: { active: true } });
  }

  async findById(id: number) {
    return this.prisma.service.findUnique({ where: { id } });
  }
}
