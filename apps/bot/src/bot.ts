import { Bot } from "grammy";
import type { TFunction } from "i18next";
import { registerStartCommand } from "./commands/start.js";
import { registerHelpCommand } from "./commands/help.js";
import { registerAdminPanel } from "./commands/admin.js";

export interface CreateBotOptions {
  botToken: string;
  miniAppUrl: string;
  backendApiBaseUrl: string;
  adminTelegramIds: number[];
  t: TFunction;
}

export function createBot(options: CreateBotOptions): Bot {
  const { botToken, miniAppUrl, backendApiBaseUrl, adminTelegramIds, t } = options;
  const bot = new Bot(botToken);
  // Registered first so its /start hook runs before the normal one below —
  // for admins it fully replaces that reply (does not call next()); for
  // everyone else it calls next() so the normal start reply still fires.
  registerAdminPanel(bot, { adminTelegramIds, backendApiBaseUrl, botToken, miniAppUrl, t });
  registerStartCommand(bot, miniAppUrl, t);
  registerHelpCommand(bot, t);
  return bot;
}
