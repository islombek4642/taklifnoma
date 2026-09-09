import type { RsvpInput } from "../../domain/rsvp-response.js";
import type { RsvpResponse } from "../../domain/rsvp-response.js";
import type { RsvpStatus } from "../../shared/constants/rsvp-status.js";

export interface RsvpUpsertResult {
  rsvp: RsvpResponse;
  // null when this guestToken hadn't responded before (a brand-new RSVP);
  // otherwise the status it previously had, so the caller can tell a
  // genuine change of mind from a duplicate resubmission of the same
  // answer.
  previousStatus: RsvpStatus | null;
}

export interface RsvpRepository {
  create(invitationId: string, input: RsvpInput): Promise<RsvpResponse>;
  upsertByToken(invitationId: string, guestToken: string, input: RsvpInput): Promise<RsvpUpsertResult>;
  listByInvitationId(invitationId: string): Promise<RsvpResponse[]>;
}
