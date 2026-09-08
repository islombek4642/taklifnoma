import { buildApp } from "./app.js";
import { loadEnvConfig } from "./env-config.js";
import { PrismaInvitationRepository } from "../infrastructure/repositories/prisma-invitation-repository.js";
import { PrismaRsvpRepository } from "../infrastructure/repositories/prisma-rsvp-repository.js";
import { TelegramOwnerNotifier } from "../infrastructure/notifications/telegram-owner-notifier.js";
import { FilesystemTemplateRegistry } from "../infrastructure/content/filesystem-template-registry.js";
import { FilesystemMusicRegistry } from "../infrastructure/content/filesystem-music-registry.js";
import { seedContentDir } from "../infrastructure/content/seed-content-dir.js";

const config = loadEnvConfig();

await seedContentDir(config.contentDir);

const app = buildApp({
  invitationRepository: new PrismaInvitationRepository(),
  rsvpRepository: new PrismaRsvpRepository(),
  ownerNotifier: new TelegramOwnerNotifier(config.botToken),
  templateRegistry: new FilesystemTemplateRegistry(config.contentDir),
  musicRegistry: new FilesystemMusicRegistry(config.contentDir),
  contentDir: config.contentDir,
  botToken: config.botToken,
  corsOrigin: config.miniAppOrigin,
});

app
  .listen({ port: config.port, host: "0.0.0.0" })
  .then(() => console.log(`Backend listening on port ${config.port}`))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
