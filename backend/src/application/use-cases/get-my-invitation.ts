import type { InvitationRepository } from "../ports/invitation-repository.js";
import type { Invitation } from "../../domain/invitation.js";
import { NotFoundError } from "../../domain/errors.js";

export class GetMyInvitationUseCase {
  constructor(private readonly invitations: InvitationRepository) {}

  async execute(ownerTelegramId: bigint): Promise<Invitation> {
    const invitation = await this.invitations.findByOwnerTelegramId(ownerTelegramId);
    if (!invitation) throw new NotFoundError("Invitation");
    return invitation;
  }
}
