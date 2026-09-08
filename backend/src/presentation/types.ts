import type { InvitationRepository } from "../application/ports/invitation-repository.js";
import type { RsvpRepository } from "../application/ports/rsvp-repository.js";
import type { OwnerNotifier } from "../application/ports/owner-notifier.js";

export interface AppDependencies {
  invitationRepository: InvitationRepository;
  rsvpRepository: RsvpRepository;
  ownerNotifier: OwnerNotifier;
  botToken: string;
}

declare module "fastify" {
  interface FastifyRequest {
    ownerTelegramId?: bigint;
  }
}
