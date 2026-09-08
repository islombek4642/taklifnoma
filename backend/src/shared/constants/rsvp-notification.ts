import { RSVP_STATUS, type RsvpStatus } from "./rsvp-status.js";

export const RSVP_STATUS_LABELS_UZ: Record<RsvpStatus, string> = {
  [RSVP_STATUS.COMING]: "Keladi",
  [RSVP_STATUS.NOT_COMING]: "Kelmaydi",
};

export function buildRsvpNotificationText(guestName: string, status: RsvpStatus): string {
  return `Yangi RSVP: ${guestName} — ${RSVP_STATUS_LABELS_UZ[status]}`;
}
