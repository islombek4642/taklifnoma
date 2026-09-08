import { describe, expect, it } from "vitest";
import { createI18n } from "../../../src/i18n/i18n.js";

describe("createI18n", () => {
  it("resolves uz start messages", () => {
    const i18n = createI18n();

    expect(i18n.t("start.welcome")).toContain("Assalomu alaykum");
    expect(i18n.t("start.openApp")).toBe("Taklifnoma yaratish");
  });

  it("falls back to uz for languages with an empty resource file", () => {
    const i18n = createI18n();

    expect(i18n.t("start.welcome", { lng: "ru" })).toBe(i18n.t("start.welcome", { lng: "uz" }));
    expect(i18n.t("start.welcome", { lng: "en" })).toBe(i18n.t("start.welcome", { lng: "uz" }));
  });
});
