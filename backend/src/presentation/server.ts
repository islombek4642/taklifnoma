import { buildApp } from "./app.js";
import { loadEnvConfig } from "./env-config.js";
import { PrismaInvitationRepository } from "../infrastructure/repositories/prisma-invitation-repository.js";
import { PrismaRsvpRepository } from "../infrastructure/repositories/prisma-rsvp-repository.js";
import { TelegramOwnerNotifier } from "../infrastructure/notifications/telegram-owner-notifier.js";

const config = loadEnvConfig();

const app = buildApp({
  invitationRepository: new PrismaInvitationRepository(),
  rsvpRepository: new PrismaRsvpRepository(),
  ownerNotifier: new TelegramOwnerNotifier(config.botToken),
  botToken: config.botToken,
});

app
  .listen({ port: config.port, host: "0.0.0.0" })
  .then(() => console.log(`Backend listening on port ${config.port}`))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
