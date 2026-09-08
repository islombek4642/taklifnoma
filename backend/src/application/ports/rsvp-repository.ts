import type { RsvpInput } from "../../domain/rsvp-response.js";
import type { RsvpResponse } from "../../domain/rsvp-response.js";

export interface RsvpRepository {
  create(invitationId: string, input: RsvpInput): Promise<RsvpResponse>;
  listByInvitationId(invitationId: string): Promise<RsvpResponse[]>;
}
