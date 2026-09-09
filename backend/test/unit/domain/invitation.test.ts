import { describe, expect, it } from "vitest";
import { DomainValidationError } from "../../../src/domain/errors.js";
import { validateInvitationInput, slugify, type InvitationInput } from "../../../src/domain/invitation.js";

const validInput: InvitationInput = {
  groomName: "Ulug'bek",
  brideName: "Malika",
  eventDateTime: new Date("2026-11-11T17:00:00.000Z"),
  venueName: "Baxtiyor restorani",
  venueAddress: "Toshkent viloyati, Qibray tumani",
  mapUrl: "https://maps.google.com/?q=41.0,69.0",
  greetingText: "Aziz mehmonlar!",
  templateId: "classic",
  musicTrackId: "romantic-piano",
};

describe("validateInvitationInput", () => {
  it("accepts a fully valid input", () => {
    expect(() => validateInvitationInput(validInput)).not.toThrow();
  });

  it.each([
    ["groomName", { ...validInput, groomName: "" }],
    ["brideName", { ...validInput, brideName: "  " }],
    ["venueName", { ...validInput, venueName: "" }],
    ["venueAddress", { ...validInput, venueAddress: "" }],
    ["templateId", { ...validInput, templateId: "" }],
  ])("rejects empty %s", (field, input) => {
    try {
      validateInvitationInput(input as InvitationInput);
      throw new Error("expected validateInvitationInput to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(DomainValidationError);
      expect((error as DomainValidationError).field).toBe(field);
    }
  });

  it("accepts an empty musicTrackId — no background music is a valid choice", () => {
    expect(() => validateInvitationInput({ ...validInput, musicTrackId: "" })).not.toThrow();
  });

  it("rejects an invalid eventDateTime", () => {
    try {
      validateInvitationInput({ ...validInput, eventDateTime: new Date("not-a-date") });
      throw new Error("expected validateInvitationInput to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(DomainValidationError);
      expect((error as DomainValidationError).field).toBe("eventDateTime");
    }
  });
});

describe("slugify", () => {
  it("builds a lowercase hyphenated slug from both names", () => {
    expect(slugify("Ulug'bek", "Malika")) .toBe("ulugbek-malika");
  });

  it("strips characters that are not letters, digits or hyphens", () => {
    expect(slugify("Anna!!", "John Doe")).toBe("anna-john-doe");
  });
});
