export interface BotEnvConfig {
  botToken: string;
  miniAppUrl: string;
  backendApiBaseUrl: string;
  adminTelegramIds: number[];
}

function parseAdminTelegramIds(raw: string | undefined): number[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0)
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id));
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

  const backendApiBaseUrl = process.env.BACKEND_API_BASE_URL;
  if (!backendApiBaseUrl) {
    throw new Error("BACKEND_API_BASE_URL environment variable is required");
  }

  // Optional: an empty/unset list just means the admin panel never shows
  // for anyone — the bot still works for guests either way.
  const adminTelegramIds = parseAdminTelegramIds(process.env.ADMIN_TELEGRAM_IDS);

  return { botToken, miniAppUrl, backendApiBaseUrl, adminTelegramIds };
}
