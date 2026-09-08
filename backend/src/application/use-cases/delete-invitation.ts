import type { InvitationRepository } from "../ports/invitation-repository.js";
import { NotFoundError } from "../../domain/errors.js";

export class DeleteInvitationUseCase {
  constructor(private readonly invitations: InvitationRepository) {}

  async execute(ownerTelegramId: bigint): Promise<void> {
    const existing = await this.invitations.findByOwnerTelegramId(ownerTelegramId);
    if (!existing) throw new NotFoundError("Invitation");

    await this.invitations.delete(existing.id);
  }
}
