import type { InvitationRepository } from "../ports/invitation-repository.js";
import type { RsvpRepository } from "../ports/rsvp-repository.js";
import type { OwnerNotifier } from "../ports/owner-notifier.js";
import type { RsvpInput, RsvpResponse } from "../../domain/rsvp-response.js";
import { validateRsvpInput } from "../../domain/rsvp-response.js";
import { NotFoundError } from "../../domain/errors.js";

export interface SubmitRsvpRequest {
  slug: string;
  input: RsvpInput;
}

export class SubmitRsvpUseCase {
  constructor(
    private readonly invitations: InvitationRepository,
    private readonly rsvps: RsvpRepository,
    private readonly notifier: OwnerNotifier,
  ) {}

  async execute(request: SubmitRsvpRequest): Promise<RsvpResponse> {
    validateRsvpInput(request.input);

    const invitation = await this.invitations.findBySlug(request.slug);
    if (!invitation) throw new NotFoundError("Invitation");

    if (request.input.guestToken) {
      const { rsvp, previousStatus } = await this.rsvps.upsertByToken(
        invitation.id,
        request.input.guestToken,
        request.input,
      );
      // Skip the notification when this is the same guest resubmitting the
      // same answer (a double-tap, or reopening the link) — only a new
      // response or a genuine change of mind is worth telling the owner.
      if (previousStatus === null || previousStatus !== rsvp.status) {
        await this.notifier.notifyNewRsvp(invitation.ownerChatId, rsvp);
      }
      return rsvp;
    }

    const rsvp = await this.rsvps.create(invitation.id, request.input);
    await this.notifier.notifyNewRsvp(invitation.ownerChatId, rsvp);
    return rsvp;
  }
}
