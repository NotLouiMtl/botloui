import { Telegraf } from 'telegraf';
import { PrismaService } from '../../prisma/prisma.service';

export function registerServiciosHandler(bot: Telegraf, prisma: PrismaService) {
  bot.command('servicios', async (ctx) => {
    const services = await prisma.service.findMany({
      where: { active: true },
      include: { accounts: { include: { profiles: { where: { isOccupied: false }, select: { id: true } } } } },
    });

    const available = services
      .map((s) => ({ ...s, stock: s.accounts.reduce((sum, a) => sum + a.profiles.length, 0) }))
      .filter((s) => s.stock > 0);

    if (available.length === 0) return ctx.reply('No hay servicios disponibles.');

    const keyboard = available.map((s) => [
      { text: `${s.name} - $${s.price} (${s.stock} disp.)`, callback_data: `buy_${s.id}` },
    ]);

    ctx.reply('Selecciona un servicio:', {
      reply_markup: { inline_keyboard: keyboard },
    });
  });
}
