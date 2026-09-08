import { loadEnvConfig } from "./config/env-config.js";
import { createI18n } from "./i18n/i18n.js";
import { createBot } from "./bot.js";

const config = loadEnvConfig();
const i18n = createI18n();
const bot = createBot(config.botToken, config.miniAppUrl, i18n.t.bind(i18n));

bot
  .start({ onStart: () => console.log("Bot started (long polling)") })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());
