import { describe, expect, it } from "vitest";
import { DomainValidationError } from "../../../src/domain/errors.js";
import { validateRsvpInput, type RsvpInput } from "../../../src/domain/rsvp-response.js";

describe("validateRsvpInput", () => {
  it("accepts a valid COMING response", () => {
    const input: RsvpInput = { guestName: "Aziza", status: "COMING" };
    expect(() => validateRsvpInput(input)).not.toThrow();
  });

  it("rejects an empty guest name", () => {
    try {
      validateRsvpInput({ guestName: "  ", status: "COMING" });
      throw new Error("expected validateRsvpInput to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(DomainValidationError);
      expect((error as DomainValidationError).field).toBe("guestName");
    }
  });

  it("rejects a guest name longer than the configured limit", () => {
    const tooLong = "a".repeat(101);
    try {
      validateRsvpInput({ guestName: tooLong, status: "COMING" });
      throw new Error("expected validateRsvpInput to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(DomainValidationError);
      expect((error as DomainValidationError).field).toBe("guestName");
    }
  });

  it("rejects an invalid status", () => {
    try {
      validateRsvpInput({ guestName: "Aziza", status: "MAYBE" });
      throw new Error("expected validateRsvpInput to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(DomainValidationError);
      expect((error as DomainValidationError).field).toBe("status");
    }
  });
});
