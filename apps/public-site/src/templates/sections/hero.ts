import type { TFunction } from "i18next";
import type { PublicInvitationDto } from "../../services/backend-api-client.js";
import { escapeHtml } from "../sanitize.js";
import { formatEventDateUz } from "../format-event-date.js";

export function renderHeroSection(invitation: PublicInvitationDto, t: TFunction): string {
  const greeting = invitation.greetingText ?? t("hero.defaultGreeting");
  return `
    <section class="hero">
      <h1>${escapeHtml(invitation.groomName)} &amp; ${escapeHtml(invitation.brideName)}</h1>
      <p class="hero__date">${formatEventDateUz(invitation.eventDateTime)}</p>
      <p class="hero__greeting">${escapeHtml(greeting)}</p>
    </section>
  `;
}
