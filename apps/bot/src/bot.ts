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
  // Registered first so its /start hook (admin-only, always calls next())
  // runs before the normal start reply below, adding the admin panel's
  // reply-keyboard entry point as an extra message rather than replacing
  // the normal "open app" reply admins get like everyone else.
  registerAdminPanel(bot, { adminTelegramIds, backendApiBaseUrl, botToken, t });
  registerStartCommand(bot, miniAppUrl, t);
  registerHelpCommand(bot, t);
  return bot;
}
