export interface EnvConfig {
  botToken: string;
  port: number;
}

export function loadEnvConfig(): EnvConfig {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN environment variable is required");
  }

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  if (Number.isNaN(port)) {
    throw new Error("PORT environment variable must be a number");
  }

  return { botToken, port };
}
