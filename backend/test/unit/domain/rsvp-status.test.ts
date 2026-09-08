import { describe, expect, it } from "vitest";
import { RSVP_STATUS, isRsvpStatus } from "../../../src/shared/constants/rsvp-status.js";

describe("RSVP_STATUS", () => {
  it("accepts COMING and NOT_COMING as valid statuses", () => {
    expect(isRsvpStatus(RSVP_STATUS.COMING)).toBe(true);
    expect(isRsvpStatus(RSVP_STATUS.NOT_COMING)).toBe(true);
  });

  it("rejects any other string", () => {
    expect(isRsvpStatus("MAYBE")).toBe(false);
  });
});
