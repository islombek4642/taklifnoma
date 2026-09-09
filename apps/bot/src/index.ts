import { loadEnvConfig } from "./config/env-config.js";
import { createI18n } from "./i18n/i18n.js";
import { createBot } from "./bot.js";
import { registerCommandMenu } from "./commands/command-menu.js";
import { resetMenuButtonToDefault } from "./commands/menu-button.js";

const config = loadEnvConfig();
const i18n = createI18n();
const t = i18n.t.bind(i18n);
const bot = createBot({
  botToken: config.botToken,
  miniAppUrl: config.miniAppUrl,
  backendApiBaseUrl: config.backendApiBaseUrl,
  adminTelegramIds: config.adminTelegramIds,
  t,
});

await registerCommandMenu(bot, t);
await resetMenuButtonToDefault(bot);

bot
  .start({ onStart: () => console.log("Bot started (long polling)") })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());
