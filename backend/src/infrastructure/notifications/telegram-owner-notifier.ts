import type { OwnerNotifier } from "../../application/ports/owner-notifier.js";
import type { RsvpResponse } from "../../domain/rsvp-response.js";
import { buildRsvpNotificationText } from "../../shared/constants/rsvp-notification.js";

const TELEGRAM_API_BASE = "https://api.telegram.org";

export class TelegramOwnerNotifier implements OwnerNotifier {
  constructor(private readonly botToken: string) {}

  async notifyNewRsvp(ownerChatId: bigint, rsvp: RsvpResponse): Promise<void> {
    const text = buildRsvpNotificationText(rsvp.guestName, rsvp.status);

    try {
      const response = await fetch(`${TELEGRAM_API_BASE}/bot${this.botToken}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: ownerChatId.toString(), text }),
      });

      if (!response.ok) {
        console.error(`[TelegramOwnerNotifier] Telegram API returned ${response.status}`);
      }
    } catch (error) {
      // A guest's RSVP must still succeed even if the owner notification
      // fails (e.g. the owner blocked the bot) — log and move on.
      console.error("[TelegramOwnerNotifier] Failed to send RSVP notification", error);
    }
  }
}
