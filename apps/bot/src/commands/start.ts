import { InlineKeyboard, type Bot } from "grammy";
import type { TFunction } from "i18next";

export function buildStartMessage(t: TFunction): string {
  return t("start.welcome");
}

export function buildStartKeyboard(miniAppUrl: string, t: TFunction): InlineKeyboard {
  return new InlineKeyboard().webApp(t("start.openApp"), miniAppUrl);
}

export function registerStartCommand(bot: Bot, miniAppUrl: string, t: TFunction): void {
  bot.command("start", async (ctx) => {
    await ctx.reply(buildStartMessage(t), { reply_markup: buildStartKeyboard(miniAppUrl, t) });
  });
}
