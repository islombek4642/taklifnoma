import type { Bot } from "grammy";
import type { TFunction } from "i18next";

export function buildMenuButton(t: TFunction, miniAppUrl: string) {
  return { type: "web_app" as const, text: t("start.openApp"), web_app: { url: miniAppUrl } };
}

// The bot's persistent Menu Button (shown next to the message box, and as
// "Open App" on the bot's profile) opens a Web App with valid initData,
// unlike a reply-keyboard web_app button — so this is the right place for
// an always-available "open the Mini App" action.
export async function registerMenuButton(bot: Bot, t: TFunction, miniAppUrl: string): Promise<void> {
  await bot.api.setChatMenuButton({ menu_button: buildMenuButton(t, miniAppUrl) });
}
