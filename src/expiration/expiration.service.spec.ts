import { Test, TestingModule } from '@nestjs/testing';
import { ExpirationService } from './expiration.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ExpirationService', () => {
  let service: ExpirationService;
  let mockPrisma: any;
  let mockTx: any;

  beforeEach(async () => {
    mockTx = {
      purchase: { update: jest.fn() },
      profile: { update: jest.fn() },
    };

    mockPrisma = {
      purchase: {
        findMany: jest.fn(),
      },
      $transaction: jest.fn((cb: any) => cb(mockTx)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpirationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ExpirationService>(ExpirationService);
  });

  it('libera perfiles expirados', async () => {
    const expired = [
      { id: 1, profileId: 1, profile: { id: 1 } },
      { id: 2, profileId: 2, profile: { id: 2 } },
    ];
    mockPrisma.purchase.findMany.mockResolvedValue(expired);

    await service.liberarExpirados();

    expect(mockTx.purchase.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: 'expired' },
    });
    expect(mockTx.purchase.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: { status: 'expired' },
    });
    expect(mockTx.profile.update).toHaveBeenCalledTimes(2);
  });

  it('no hace nada si no hay expirados', async () => {
    mockPrisma.purchase.findMany.mockResolvedValue([]);
    await service.liberarExpirados();
    expect(mockTx.purchase.update).not.toHaveBeenCalled();
  });
});
