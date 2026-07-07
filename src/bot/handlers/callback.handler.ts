import { Telegraf, Markup } from 'telegraf';
import { UsersService } from '../../users/users.service';
import { PurchasesService } from '../../purchases/purchases.service';
import { PrismaService } from '../../prisma/prisma.service';

export function registerCallbackHandler(bot: Telegraf, usersService: UsersService, purchasesService: PurchasesService, prisma: PrismaService) {
  bot.on('callback_query', async (ctx) => {
    if (!('data' in ctx.callbackQuery)) return;
    const data = ctx.callbackQuery.data;
    await ctx.answerCbQuery();

    if (data === 'menu_saldo') {
      const saldo = await usersService.getSaldo(BigInt(ctx.from.id));
      return ctx.reply(`💰 Tu saldo: $${saldo}`);
    }

    if (data === 'menu_servicios') {
      const services = await prisma.service.findMany({
        where: { active: true },
        include: { accounts: { include: { profiles: { where: { isOccupied: false }, select: { id: true } } } } },
      });

      const available = services
        .map((s) => ({ ...s, stock: s.accounts.reduce((sum, a) => sum + a.profiles.length, 0) }))
        .filter((s) => s.stock > 0);

      if (available.length === 0) return ctx.reply('No hay servicios disponibles.');

      const keyboard = available.map((s) => [
        Markup.button.callback(`${s.name} - $${s.price} (${s.stock} disp.)`, `buy_${s.id}`),
      ]);

      return ctx.reply('Selecciona un servicio:', { reply_markup: { inline_keyboard: keyboard } });
    }

    if (data.startsWith('buy_')) {
      const serviceId = parseInt(data.replace('buy_', ''));
      if (isNaN(serviceId)) return ctx.reply('ID inválido');

      try {
        const user = await usersService.findByTelegramId(BigInt(ctx.from.id));
        if (!user) return ctx.reply('No estas registrado. Usa /start');

        const result = await purchasesService.comprar(user.id, serviceId);

        if (result.type === 'full' && result.account) {
          const a = result.account;
          const pinText = a.pin ? `\nPIN: ${a.pin}` : '';
          await ctx.editMessageText(
            `✅ Compra exitosa!\n\nCuenta: ${a.email}\nPassword: ${a.password}${pinText}\n\nEsta cuenta expira en 30 días.`
          );
        } else if (result.profile) {
          const profile = result.profile;
          const pinText = profile.pin
            ? `\nPIN del perfil: ${profile.pin}`
            : profile.account.pin
              ? `\nPIN: ${profile.account.pin}`
              : '';
          await ctx.editMessageText(
            `✅ Compra exitosa!\n\nCuenta: ${profile.account.email}\nPassword: ${profile.account.password}${pinText}\nPerfil: #${profile.profileNumber}\n\nEste perfil expira en 30 días.`
          );
        }
      } catch (error: any) {
        ctx.reply(error.message || 'Error al procesar la compra.');
      }
    }
  });
}
