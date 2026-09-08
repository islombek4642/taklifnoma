import type { TFunction } from "i18next";
import type { PublicInvitationDto } from "../../services/backend-api-client.js";
import { findMusicTrackById } from "../../constants/music-tracks.js";
import { escapeHtml } from "../sanitize.js";

export function renderMusicSection(invitation: PublicInvitationDto, t: TFunction): string {
  const track = findMusicTrackById(invitation.musicTrackId);
  if (!track) return "";

  return `
    <button class="music-toggle" type="button" data-music-toggle aria-label="${t("music.toggleLabel")}">🎵</button>
    <audio data-music-audio src="${escapeHtml(track.fileUrl)}" loop></audio>
  `;
}
