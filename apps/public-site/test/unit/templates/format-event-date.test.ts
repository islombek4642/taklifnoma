import { describe, expect, it } from "vitest";
import { formatEventDateUz } from "../../../src/templates/format-event-date.js";

describe("formatEventDateUz", () => {
  it("formats an ISO instant as '<day>-<month>, <year>-yil'", () => {
    expect(formatEventDateUz("2026-11-11T17:00:00.000Z")).toBe("11-noyabr, 2026-yil");
  });
});
