import type { Bot } from "grammy";

// setChatMenuButton is a persistent setting on Telegram's side — it isn't
// reset just because the code that originally called it goes away, so an
// earlier release setting a web_app menu button would otherwise leave that
// button showing forever. This explicitly restores Telegram's default menu
// button (the commands list, populated by setMyCommands) on every startup.
export async function resetMenuButtonToDefault(bot: Bot): Promise<void> {
  await bot.api.setChatMenuButton({ menu_button: { type: "default" } });
}
