import type { TFunction } from "i18next";
import { escapeHtml } from "../sanitize.js";

export function renderMusicSection(t: TFunction, musicFileUrl: string | undefined): string {
  if (!musicFileUrl) return "";

  return `
    <button class="taklifnoma-music-toggle" type="button" data-music-toggle aria-label="${t("music.toggleLabel")}">
      <span class="taklifnoma-music-toggle__icon" aria-hidden="true">🎵</span>
      <span class="taklifnoma-music-toggle__wave" aria-hidden="true">
        <span></span><span></span><span></span><span></span>
      </span>
    </button>
    <audio data-music-audio src="${escapeHtml(musicFileUrl)}" loop></audio>
  `;
}
