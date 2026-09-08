import { describe, expect, it } from "vitest";
import {
  INITIAL_BUILDER_FORM_STATE,
  isStepValid,
  toInvitationInput,
  fromInvitation,
  type BuilderFormState,
} from "../../../src/features/builder/builder-form.js";
import type { InvitationDto } from "../../../src/services/api-client.js";

describe("isStepValid", () => {
  it("requires both names on step 0", () => {
    expect(isStepValid(0, INITIAL_BUILDER_FORM_STATE)).toBe(false);
    expect(isStepValid(0, { ...INITIAL_BUILDER_FORM_STATE, groomName: "A", brideName: "B" })).toBe(true);
  });

  it("requires date and time on step 1", () => {
    expect(isStepValid(1, INITIAL_BUILDER_FORM_STATE)).toBe(false);
    expect(isStepValid(1, { ...INITIAL_BUILDER_FORM_STATE, eventDate: "2026-11-11", eventTime: "17:00" })).toBe(true);
  });

  it("treats the greeting step as always valid (optional field)", () => {
    expect(isStepValid(3, INITIAL_BUILDER_FORM_STATE)).toBe(true);
  });

  it("requires a music track on step 4", () => {
    expect(isStepValid(4, INITIAL_BUILDER_FORM_STATE)).toBe(false);
    expect(isStepValid(4, { ...INITIAL_BUILDER_FORM_STATE, musicTrackId: "romantic-piano" })).toBe(true);
  });
});

describe("toInvitationInput", () => {
  it("combines date and time into a single ISO eventDateTime", () => {
    const state: BuilderFormState = {
      ...INITIAL_BUILDER_FORM_STATE,
      groomName: " Ulug'bek ",
      brideName: "Malika",
      eventDate: "2026-11-11",
      eventTime: "17:00",
      venueName: "Baxtiyor restorani",
      venueAddress: "Toshkent",
      musicTrackId: "romantic-piano",
    };

    const input = toInvitationInput(state);

    expect(input.groomName).toBe("Ulug'bek");
    expect(input.eventDateTime).toBe(new Date("2026-11-11T17:00:00").toISOString());
  });

  it("omits optional fields when blank", () => {
    const state: BuilderFormState = {
      ...INITIAL_BUILDER_FORM_STATE,
      groomName: "A",
      brideName: "B",
      eventDate: "2026-11-11",
      eventTime: "17:00",
      venueName: "V",
      venueAddress: "Addr",
      musicTrackId: "romantic-piano",
      mapUrl: "  ",
      greetingText: "  ",
    };

    const input = toInvitationInput(state);

    expect(input.mapUrl).toBeUndefined();
    expect(input.greetingText).toBeUndefined();
  });
});

describe("fromInvitation", () => {
  it("splits eventDateTime back into separate date and time fields", () => {
    const invitation = {
      groomName: "A",
      brideName: "B",
      eventDateTime: "2026-11-11T17:00:00.000Z",
      venueName: "V",
      venueAddress: "Addr",
      mapUrl: null,
      greetingText: null,
      musicTrackId: "romantic-piano",
    } as InvitationDto;

    const state = fromInvitation(invitation);

    expect(state.eventDate).toBe("2026-11-11");
    expect(state.eventTime).toBe("17:00");
    expect(state.mapUrl).toBe("");
  });
});
