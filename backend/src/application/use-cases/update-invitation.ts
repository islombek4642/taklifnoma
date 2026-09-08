import type { InvitationRepository } from "../ports/invitation-repository.js";
import type { Invitation, InvitationInput } from "../../domain/invitation.js";
import { validateInvitationInput } from "../../domain/invitation.js";
import { NotFoundError } from "../../domain/errors.js";

export interface UpdateInvitationRequest {
  ownerTelegramId: bigint;
  input: Partial<InvitationInput>;
}

export class UpdateInvitationUseCase {
  constructor(private readonly invitations: InvitationRepository) {}

  async execute(request: UpdateInvitationRequest): Promise<Invitation> {
    const existing = await this.invitations.findByOwnerTelegramId(request.ownerTelegramId);
    if (!existing) throw new NotFoundError("Invitation");

    const merged: InvitationInput = { ...existing, ...request.input };
    validateInvitationInput(merged);

    return this.invitations.update(existing.id, request.input);
  }
}
