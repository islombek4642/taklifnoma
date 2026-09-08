import { Bot } from "grammy";
import type { TFunction } from "i18next";
import { registerStartCommand } from "./commands/start.js";

export function createBot(botToken: string, miniAppUrl: string, t: TFunction): Bot {
  const bot = new Bot(botToken);
  registerStartCommand(bot, miniAppUrl, t);
  return bot;
}
