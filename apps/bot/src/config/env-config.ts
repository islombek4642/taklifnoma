export interface BotEnvConfig {
  botToken: string;
  miniAppUrl: string;
}

export function loadEnvConfig(): BotEnvConfig {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN environment variable is required");
  }

  const miniAppUrl = process.env.MINIAPP_URL;
  if (!miniAppUrl) {
    throw new Error("MINIAPP_URL environment variable is required");
  }

  return { botToken, miniAppUrl };
}
