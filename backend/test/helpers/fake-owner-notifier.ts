import type { OwnerNotifier } from "../../src/application/ports/owner-notifier.js";
import type { RsvpResponse } from "../../src/domain/rsvp-response.js";

export class FakeOwnerNotifier implements OwnerNotifier {
  readonly notifications: Array<{ ownerChatId: bigint; rsvp: RsvpResponse }> = [];

  async notifyNewRsvp(ownerChatId: bigint, rsvp: RsvpResponse): Promise<void> {
    this.notifications.push({ ownerChatId, rsvp });
  }
}
