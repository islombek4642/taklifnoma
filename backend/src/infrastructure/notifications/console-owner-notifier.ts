import type { OwnerNotifier } from "../../application/ports/owner-notifier.js";
import type { RsvpResponse } from "../../domain/rsvp-response.js";

export class ConsoleOwnerNotifier implements OwnerNotifier {
  async notifyNewRsvp(ownerChatId: bigint, rsvp: RsvpResponse): Promise<void> {
    console.log(`[RSVP] chatId=${ownerChatId} guest=${rsvp.guestName} status=${rsvp.status}`);
  }
}
