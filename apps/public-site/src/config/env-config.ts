export interface EnvConfig {
  backendApiBaseUrl: string;
  port: number;
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

  return { backendApiBaseUrl, port };
}
