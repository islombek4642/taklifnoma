import path from "node:path";

export interface EnvConfig {
  botToken: string;
  port: number;
  miniAppOrigin: string;
  contentDir: string;
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

  // Where uploaded templates/music live (content/templates, content/music).
  // In production this points at a subdirectory of the mounted data volume
  // so it survives container recreation; defaults to a local folder for dev.
  const contentDir = process.env.CONTENT_DIR ?? path.join(process.cwd(), "content");

  return { botToken, port, miniAppOrigin, contentDir };
}
