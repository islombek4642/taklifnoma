export const API_ROUTES = {
  CREATE_INVITATION: "/api/invitations",
  MY_INVITATION: "/api/invitations/me",
  MY_GUESTS: "/api/invitations/me/guests",
  PUBLIC_INVITATION_BY_SLUG: "/api/public/invitations/:slug",
  PUBLIC_RSVP: "/api/public/invitations/:slug/rsvp",
  TEMPLATES: "/api/templates",
  MUSIC_TRACKS: "/api/music-tracks",
  ADMIN_MUSIC_TRACKS: "/api/admin/music-tracks",
} as const;

export const MEDIA_ROUTES = {
  MUSIC_PREFIX: "/media/music/",
} as const;
