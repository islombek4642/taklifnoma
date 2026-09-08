import type { TFunction } from "i18next";
import { escapeHtml } from "../sanitize.js";

export function renderMusicSection(t: TFunction, musicFileUrl: string | undefined): string {
  if (!musicFileUrl) return "";

  return `
    <button class="music-toggle" type="button" data-music-toggle aria-label="${t("music.toggleLabel")}">🎵</button>
    <audio data-music-audio src="${escapeHtml(musicFileUrl)}" loop></audio>
  `;
}
