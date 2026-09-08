import type { InvitationRepository } from "../ports/invitation-repository.js";
import type { Invitation } from "../../domain/invitation.js";
import { NotFoundError } from "../../domain/errors.js";

export class GetInvitationBySlugUseCase {
  constructor(private readonly invitations: InvitationRepository) {}

  async execute(slug: string): Promise<Invitation> {
    const invitation = await this.invitations.findBySlug(slug);
    if (!invitation) throw new NotFoundError("Invitation");
    return invitation;
  }
}
