import type { TFunction } from "i18next";
import type { PublicInvitationDto } from "../services/backend-api-client.js";

const PREVIEW_EVENT_OFFSET_MS = 30 * 24 * 60 * 60 * 1000;

// The "Ko'rish" button in the Mini App's template gallery renders a real
// invitation page for a template, so guests see the actual design before
// it's chosen — but there's no real invitation yet at that point, so this
// fills in the sections with sample content instead.
export function buildPreviewInvitation(templateId: string, t: TFunction, musicTrackId: string): PublicInvitationDto {
  return {
    id: "preview",
    slug: "preview",
    groomName: t("preview.groomName"),
    brideName: t("preview.brideName"),
    eventDateTime: new Date(Date.now() + PREVIEW_EVENT_OFFSET_MS).toISOString(),
    venueName: t("preview.venueName"),
    venueAddress: t("preview.venueAddress"),
    mapUrl: null,
    greetingText: null,
    templateId,
    musicTrackId,
  };
}
