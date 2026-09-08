export const RSVP_STATUS = {
  COMING: "COMING",
  NOT_COMING: "NOT_COMING",
} as const;

export type RsvpStatus = (typeof RSVP_STATUS)[keyof typeof RSVP_STATUS];
