import type { InvitationRepository } from "../ports/invitation-repository.js";
import type { Invitation, InvitationInput } from "../../domain/invitation.js";
import { validateInvitationInput, slugify } from "../../domain/invitation.js";
import { ConflictError } from "../../domain/errors.js";

export interface CreateInvitationRequest {
  ownerTelegramId: bigint;
  ownerChatId: bigint;
  input: InvitationInput;
}

export class CreateInvitationUseCase {
  constructor(private readonly invitations: InvitationRepository) {}

  async execute(request: CreateInvitationRequest): Promise<Invitation> {
    validateInvitationInput(request.input);

    const existing = await this.invitations.findByOwnerTelegramId(request.ownerTelegramId);
    if (existing) {
      throw new ConflictError("This Telegram account already has an invitation");
    }

    const slug = await this.generateUniqueSlug(request.input.groomName, request.input.brideName);

    return this.invitations.create({
      ...request.input,
      slug,
      ownerTelegramId: request.ownerTelegramId,
      ownerChatId: request.ownerChatId,
    });
  }

  private async generateUniqueSlug(groomName: string, brideName: string): Promise<string> {
    const base = slugify(groomName, brideName);
    let candidate = base;
    let suffix = 1;

    while (await this.invitations.slugExists(candidate)) {
      suffix += 1;
      candidate = `${base}-${suffix}`;
    }

    return candidate;
  }
}
