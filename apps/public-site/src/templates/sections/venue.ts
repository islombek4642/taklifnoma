import type { TFunction } from "i18next";
import type { PublicInvitationDto } from "../../services/backend-api-client.js";
import { escapeHtml, isSafeHttpUrl } from "../sanitize.js";

export function renderVenueSection(invitation: PublicInvitationDto, t: TFunction): string {
  const mapLink =
    invitation.mapUrl && isSafeHttpUrl(invitation.mapUrl)
      ? `<a class="venue__map-link" href="${escapeHtml(invitation.mapUrl)}" target="_blank" rel="noreferrer">${t("venue.mapButton")}</a>`
      : "";

  return `
    <section class="venue">
      <h2>${t("venue.title")}</h2>
      <p class="venue__name">${escapeHtml(invitation.venueName)}</p>
      <p class="venue__address">${escapeHtml(invitation.venueAddress)}</p>
      ${mapLink}
    </section>
  `;
}
