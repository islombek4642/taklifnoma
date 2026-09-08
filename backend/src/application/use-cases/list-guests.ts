import type { InvitationRepository } from "../ports/invitation-repository.js";
import type { RsvpRepository } from "../ports/rsvp-repository.js";
import type { RsvpResponse } from "../../domain/rsvp-response.js";
import { NotFoundError } from "../../domain/errors.js";

export class ListGuestsUseCase {
  constructor(
    private readonly invitations: InvitationRepository,
    private readonly rsvps: RsvpRepository,
  ) {}

  async execute(ownerTelegramId: bigint): Promise<RsvpResponse[]> {
    const invitation = await this.invitations.findByOwnerTelegramId(ownerTelegramId);
    if (!invitation) throw new NotFoundError("Invitation");

    return this.rsvps.listByInvitationId(invitation.id);
  }
}
