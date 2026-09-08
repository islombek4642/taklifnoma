import { DomainValidationError } from "./errors.js";
import { isRsvpStatus, type RsvpStatus } from "../shared/constants/rsvp-status.js";
import { LIMITS } from "../shared/constants/limits.js";

export interface RsvpInput {
  guestName: string;
  status: string;
}

export interface RsvpResponse {
  id: string;
  invitationId: string;
  guestName: string;
  status: RsvpStatus;
  respondedAt: Date;
}

export function validateRsvpInput(input: RsvpInput): void {
  const name = input.guestName.trim();

  if (name.length === 0) {
    throw new DomainValidationError("guestName", "guestName is required");
  }

  if (name.length > LIMITS.GUEST_NAME_MAX_LENGTH) {
    throw new DomainValidationError(
      "guestName",
      `guestName must be at most ${LIMITS.GUEST_NAME_MAX_LENGTH} characters`,
    );
  }

  if (!isRsvpStatus(input.status)) {
    throw new DomainValidationError("status", "status must be COMING or NOT_COMING");
  }
}
