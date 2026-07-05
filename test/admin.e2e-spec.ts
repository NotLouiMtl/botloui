import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { BotService } from '../src/bot/bot.service';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';

const mockTx = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  transaction: {
    create: jest.fn(),
  },
  profile: {
    update: jest.fn(),
  },
};

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  service: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  account: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  profile: {
    count: jest.fn(),
    findMany: jest.fn(),
  },
  purchase: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  transaction: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
  },
  device: {
    create: jest.fn(),
  },
  $transaction: jest.fn((cb: any) => cb(mockTx)),
};

const mockBotService = {
  onModuleInit: jest.fn(),
};

describe('Admin (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideProvider(BotService)
      .useValue(mockBotService)
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: (ctx: any) => { const req = ctx.switchToHttp().getRequest(); req.user = { userId: 1 }; return true; } })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    mockPrisma.$transaction = jest.fn((cb: any) => cb(mockTx));
    token = 'test-jwt-token';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /admin/login', () => {
    it('devuelve 400 si falta password', () => {
      return request(app.getHttpServer())
        .post('/admin/login')
        .send({ telegramId: '123' })
        .expect(400);
    });

    it('devuelve 401 si credenciales invalidas', () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      return request(app.getHttpServer())
        .post('/admin/login')
        .send({ telegramId: '999', password: 'secreta' })
        .expect(401);
    });
  });

  describe('GET /admin/users', () => {
    it('devuelve lista de usuarios', () => {
      mockPrisma.user.findMany.mockResolvedValue([{ id: 1, telegramId: '123', username: 'test', role: 'USER', isBlocked: false, saldo: 100 }]);
      return request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => expect(Array.isArray(res.body)).toBe(true));
    });
  });

  describe('POST /admin/add-balance', () => {
    it('agrega saldo a usuario existente', () => {
      mockTx.user.findUnique.mockResolvedValue({ id: 1, telegramId: '123', saldo: 100 });
      return request(app.getHttpServer())
        .post('/admin/add-balance')
        .set('Authorization', `Bearer ${token}`)
        .send({ telegramId: '123', amount: 50 })
        .expect(201);
    });

    it('devuelve 404 si usuario no existe', () => {
      mockTx.user.findUnique.mockResolvedValue(null);
      return request(app.getHttpServer())
        .post('/admin/add-balance')
        .set('Authorization', `Bearer ${token}`)
        .send({ telegramId: '999', amount: 50 })
        .expect(404);
    });
  });

  describe('POST /admin/block-user', () => {
    it('bloquea usuario', () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1 });
      return request(app.getHttpServer())
        .post('/admin/block-user')
        .set('Authorization', `Bearer ${token}`)
        .send({ telegramId: '123' })
        .expect(201);
    });
  });

  describe('GET /admin/stock', () => {
    it('devuelve resumen de stock', () => {
      mockPrisma.service.findMany.mockResolvedValue([{ id: 1, name: 'Netflix', accounts: [{ profiles: [{ isOccupied: false }] }] }]);
      return request(app.getHttpServer())
        .get('/admin/stock')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('GET /admin/services', () => {
    it('devuelve lista de servicios', () => {
      mockPrisma.service.findMany.mockResolvedValue([{ id: 1, name: 'Netflix', price: 25, active: true }]);
      return request(app.getHttpServer())
        .get('/admin/services')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('POST /admin/services', () => {
    it('crea un servicio', () => {
      mockPrisma.service.create.mockResolvedValue({ id: 2, name: 'Disney+', price: 15, active: true });
      return request(app.getHttpServer())
        .post('/admin/services')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Disney+', price: 15 })
        .expect(201);
    });

    it('devuelve 400 si falta name', () => {
      return request(app.getHttpServer())
        .post('/admin/services')
        .set('Authorization', `Bearer ${token}`)
        .send({ price: 15 })
        .expect(400);
    });
  });

  describe('GET /admin/transactions', () => {
    it('devuelve lista de transacciones', () => {
      mockPrisma.transaction.findMany.mockResolvedValue([{ id: 1, userId: 1, type: 'purchase', amount: 25, createdAt: new Date(), user: { id: 1, username: 'test', telegramId: '123' } }]);
      return request(app.getHttpServer())
        .get('/admin/transactions')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('POST /admin/set-password', () => {
    it('establece password para usuario', () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce({ id: 1, role: 'ADMIN' })
        .mockResolvedValueOnce({ id: 2, telegramId: '123', role: 'USER' });
      mockPrisma.user.update.mockResolvedValue({ id: 2, telegramId: '123', role: 'USER' });
      return request(app.getHttpServer())
        .post('/admin/set-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ telegramId: '123', password: 'nueva123' })
        .expect(201);
    });
  });

  describe('GET /admin/users/:id/purchases', () => {
    it('devuelve compras del usuario', () => {
      mockPrisma.purchase.findMany.mockResolvedValue([{ id: 1, userId: 1, serviceId: 1, price: 25, createdAt: new Date(), service: { name: 'Netflix' }, profile: { account: { email: 'a@b.com' } } }]);
      return request(app.getHttpServer())
        .get('/admin/users/1/purchases')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
});
