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
import { PREVIEW_BADGE_STYLE } from "../constants/preview-badge-style.js";
import { MUSIC_TOGGLE_STYLE } from "../constants/music-toggle-style.js";

export interface RenderInvitationPageOptions {
  // Set for the template-preview page ("Ko'rish" from the Mini App's
  // template gallery): shows a "this is a demo" badge and makes the RSVP
  // modal a local-only, no-network simulation (see client-script.ts).
  previewMode?: boolean;
}

export function renderInvitationPage(
  invitation: PublicInvitationDto,
  t: TFunction,
  styleCss: string,
  musicFileUrl: string | undefined,
  options?: RenderInvitationPageOptions,
): string {
  const previewMode = options?.previewMode === true;
  const title = `${invitation.groomName} & ${invitation.brideName} — ${t("meta.titleSuffix")}`;
  const script = renderClientScript(
    invitation.slug,
    invitation.eventDateTime,
    {
      comingThankYou: t("rsvp.thankYouComing"),
      notComingThankYou: t("rsvp.thankYouNotComing"),
      error: t("rsvp.errorGeneric"),
      nameRequired: t("rsvp.errorNameRequired"),
      alreadyRespondedComing: t("rsvp.alreadyRespondedComing"),
      alreadyRespondedNotComing: t("rsvp.alreadyRespondedNotComing"),
    },
    { previewMode },
  );
  const previewBadge = previewMode
    ? `<div class="taklifnoma-preview-badge">${escapeHtml(t("preview.badge"))}</div>`
    : "";

  return `<!doctype html>
<html lang="uz">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<style>${styleCss}</style>
<style>${MODAL_STYLE}</style>
<style>${MUSIC_TOGGLE_STYLE}</style>
${previewMode ? `<style>${PREVIEW_BADGE_STYLE}</style>` : ""}
</head>
<body>
${previewBadge}
${renderHeroSection(invitation, t)}
${renderCountdownSection(invitation, t)}
${renderVenueSection(invitation, t)}
${renderRsvpSection(t)}
${renderMusicSection(t, musicFileUrl)}
<script>${script}</script>
</body>
</html>`;
}
