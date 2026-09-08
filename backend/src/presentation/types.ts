import type { InvitationRepository } from "../application/ports/invitation-repository.js";
import type { RsvpRepository } from "../application/ports/rsvp-repository.js";
import type { OwnerNotifier } from "../application/ports/owner-notifier.js";
import type { TemplateRegistry, MusicRegistry } from "../application/ports/content-registry.js";

export interface AppDependencies {
  invitationRepository: InvitationRepository;
  rsvpRepository: RsvpRepository;
  ownerNotifier: OwnerNotifier;
  templateRegistry: TemplateRegistry;
  musicRegistry: MusicRegistry;
  // Filesystem root that templateRegistry/musicRegistry read from and that
  // /media/music serves audio files out of (see app.ts).
  contentDir: string;
  botToken: string;
  // Mini App runs on its own domain and calls this API directly (unlike
  // public-site, which proxies server-side), so cross-origin requests need
  // CORS. Defaults to permissive for tests/local dev when omitted; server.ts
  // passes the real Mini App origin in production.
  corsOrigin?: string | boolean;
}

declare module "fastify" {
  interface FastifyRequest {
    ownerTelegramId?: bigint;
  }
}
