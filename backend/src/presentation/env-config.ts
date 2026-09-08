export interface EnvConfig {
  botToken: string;
  port: number;
  miniAppOrigin: string;
}

export function loadEnvConfig(): EnvConfig {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN environment variable is required");
  }

  const miniAppOrigin = process.env.MINIAPP_ORIGIN;
  if (!miniAppOrigin) {
    throw new Error("MINIAPP_ORIGIN environment variable is required");
  }

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  if (Number.isNaN(port)) {
    throw new Error("PORT environment variable must be a number");
  }

  return { botToken, port, miniAppOrigin };
}
