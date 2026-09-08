import type { Invitation } from "../domain/invitation.js";
import type { RsvpResponse } from "../domain/rsvp-response.js";

export function serializeInvitation(invitation: Invitation) {
  return {
    id: invitation.id,
    slug: invitation.slug,
    ownerTelegramId: invitation.ownerTelegramId.toString(),
    ownerChatId: invitation.ownerChatId.toString(),
    groomName: invitation.groomName,
    brideName: invitation.brideName,
    eventDateTime: invitation.eventDateTime.toISOString(),
    venueName: invitation.venueName,
    venueAddress: invitation.venueAddress,
    mapUrl: invitation.mapUrl ?? null,
    greetingText: invitation.greetingText ?? null,
    musicTrackId: invitation.musicTrackId,
    createdAt: invitation.createdAt.toISOString(),
    updatedAt: invitation.updatedAt.toISOString(),
  };
}

export function serializeGuest(rsvp: RsvpResponse) {
  return {
    id: rsvp.id,
    guestName: rsvp.guestName,
    status: rsvp.status,
    respondedAt: rsvp.respondedAt.toISOString(),
  };
}
