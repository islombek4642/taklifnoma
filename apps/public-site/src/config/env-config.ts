export interface EnvConfig {
  backendApiBaseUrl: string;
  port: number;
  botUsername: string;
}

export function loadEnvConfig(): EnvConfig {
  const backendApiBaseUrl = process.env.BACKEND_API_BASE_URL;
  if (!backendApiBaseUrl) {
    throw new Error("BACKEND_API_BASE_URL environment variable is required");
  }

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  if (Number.isNaN(port)) {
    throw new Error("PORT environment variable must be a number");
  }

  const botUsername = process.env.BOT_USERNAME;
  if (!botUsername) {
    throw new Error("BOT_USERNAME environment variable is required");
  }

  return { backendApiBaseUrl, port, botUsername };
}
