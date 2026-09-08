import type { RsvpResponse } from "../../domain/rsvp-response.js";

export interface OwnerNotifier {
  notifyNewRsvp(ownerChatId: bigint, rsvp: RsvpResponse): Promise<void>;
}
