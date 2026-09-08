import type { Bot } from "grammy";
import type { TFunction } from "i18next";
import { BOT_COMMANDS } from "../constants/commands.js";

export interface BotCommandMenuEntry {
  command: string;
  description: string;
}

export function buildCommandMenu(t: TFunction): BotCommandMenuEntry[] {
  return BOT_COMMANDS.map(({ command, descriptionKey }) => ({ command, description: t(descriptionKey) }));
}

export async function registerCommandMenu(bot: Bot, t: TFunction): Promise<void> {
  await bot.api.setMyCommands(buildCommandMenu(t));
}
