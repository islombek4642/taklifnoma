import type { TFunction } from "i18next";
import type { PublicInvitationDto } from "../services/backend-api-client.js";
import { escapeHtml } from "./sanitize.js";
import { renderClientScript } from "./client-script.js";
import { renderHeroSection } from "./sections/hero.js";
import { renderCountdownSection } from "./sections/countdown.js";
import { renderVenueSection } from "./sections/venue.js";
import { renderRsvpSection } from "./sections/rsvp.js";
import { renderMusicSection } from "./sections/music.js";
import { MODAL_STYLE } from "../constants/modal-style.js";

export function renderInvitationPage(
  invitation: PublicInvitationDto,
  t: TFunction,
  styleCss: string,
  musicFileUrl: string | undefined,
): string {
  const title = `${invitation.groomName} & ${invitation.brideName} — ${t("meta.titleSuffix")}`;
  const script = renderClientScript(invitation.slug, invitation.eventDateTime, {
    comingThankYou: t("rsvp.thankYouComing"),
    notComingThankYou: t("rsvp.thankYouNotComing"),
    error: t("rsvp.errorGeneric"),
    nameRequired: t("rsvp.errorNameRequired"),
    alreadyRespondedComing: t("rsvp.alreadyRespondedComing"),
    alreadyRespondedNotComing: t("rsvp.alreadyRespondedNotComing"),
    modalComingTitle: t("rsvp.modalComingTitle"),
    modalNotComingTitle: t("rsvp.modalNotComingTitle"),
  });

  return `<!doctype html>
<html lang="uz">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<style>${styleCss}</style>
<style>${MODAL_STYLE}</style>
</head>
<body>
${renderHeroSection(invitation, t)}
${renderCountdownSection(invitation, t)}
${renderVenueSection(invitation, t)}
${renderRsvpSection(t)}
${renderMusicSection(t, musicFileUrl)}
<script>${script}</script>
</body>
</html>`;
}
