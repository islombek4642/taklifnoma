import type { TFunction } from "i18next";
import type { PublicInvitationDto } from "../../services/backend-api-client.js";
import { escapeHtml } from "../sanitize.js";

export function renderCountdownSection(invitation: PublicInvitationDto, t: TFunction): string {
  return `
    <section class="countdown" data-event-datetime="${escapeHtml(invitation.eventDateTime)}">
      <div><span data-countdown="days">0</span><label>${t("countdown.days")}</label></div>
      <div><span data-countdown="hours">00</span><label>${t("countdown.hours")}</label></div>
      <div><span data-countdown="minutes">00</span><label>${t("countdown.minutes")}</label></div>
      <div><span data-countdown="seconds">00</span><label>${t("countdown.seconds")}</label></div>
    </section>
  `;
}
