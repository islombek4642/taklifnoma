import type { Bot } from "grammy";
import type { TFunction } from "i18next";

export function buildHelpMessage(t: TFunction): string {
  return t("help.text");
}

export function registerHelpCommand(bot: Bot, t: TFunction): void {
  bot.command("help", async (ctx) => {
    await ctx.reply(buildHelpMessage(t));
  });
}
