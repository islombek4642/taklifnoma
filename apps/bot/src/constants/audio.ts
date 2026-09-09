// Kept in sync by hand with backend/src/shared/constants/music-upload.ts —
// apps here are independently deployed with no shared package, so this is
// duplicated rather than imported (same pattern as constants/rsvp-status.ts
// in apps/miniapp).
export const ALLOWED_AUDIO_EXTENSIONS = ["mp3", "wav", "ogg", "m4a", "aac"] as const;

export const AUDIO_MIME_TO_EXTENSION: Record<string, (typeof ALLOWED_AUDIO_EXTENSIONS)[number]> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/wave": "wav",
  "audio/ogg": "ogg",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
};
