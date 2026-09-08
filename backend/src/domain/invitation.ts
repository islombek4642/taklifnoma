import { DomainValidationError } from "./errors.js";

export interface InvitationInput {
  groomName: string;
  brideName: string;
  eventDateTime: Date;
  venueName: string;
  venueAddress: string;
  mapUrl?: string;
  greetingText?: string;
  musicTrackId: string;
}

export interface Invitation extends InvitationInput {
  id: string;
  slug: string;
  ownerTelegramId: bigint;
  ownerChatId: bigint;
  createdAt: Date;
  updatedAt: Date;
}

const REQUIRED_STRING_FIELDS: Array<keyof InvitationInput> = [
  "groomName",
  "brideName",
  "venueName",
  "venueAddress",
  "musicTrackId",
];

export function validateInvitationInput(input: InvitationInput): void {
  for (const field of REQUIRED_STRING_FIELDS) {
    const value = input[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new DomainValidationError(field, `${field} is required`);
    }
  }

  if (Number.isNaN(input.eventDateTime.getTime())) {
    throw new DomainValidationError("eventDateTime", "eventDateTime must be a valid date");
  }
}

export function slugify(groomName: string, brideName: string): string {
  const clean = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/['']/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  return `${clean(groomName)}-${clean(brideName)}`;
}
