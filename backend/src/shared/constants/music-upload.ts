// Admin-uploaded music tracks (via the bot's admin panel) are restricted to
// these file types and this size, both enforced in the admin route.
export const ALLOWED_AUDIO_EXTENSIONS = ["mp3", "wav", "ogg", "m4a", "aac"] as const;

export type AllowedAudioExtension = (typeof ALLOWED_AUDIO_EXTENSIONS)[number];

export const MUSIC_UPLOAD_MAX_BYTES = 15 * 1024 * 1024;
