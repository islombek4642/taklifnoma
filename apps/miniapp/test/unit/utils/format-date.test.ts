import { describe, expect, it } from "vitest";
import { formatEventDateUz, formatRespondedAtUz } from "../../../src/utils/format-date.js";

describe("formatEventDateUz", () => {
  it("formats an ISO instant as '<day>-<month>, <year>-yil'", () => {
    expect(formatEventDateUz("2026-11-11T17:00:00.000Z")).toBe("11-noyabr, 2026-yil");
  });
});

describe("formatRespondedAtUz", () => {
  it("formats an ISO instant as '<day>-<month>, <HH:mm>'", () => {
    expect(formatRespondedAtUz("2026-01-05T09:07:00.000Z")).toBe("5-yanvar, 09:07");
  });
});
