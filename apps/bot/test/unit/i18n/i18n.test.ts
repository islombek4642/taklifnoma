import { describe, expect, it } from "vitest";
import { createI18n } from "../../../src/i18n/i18n.js";

describe("createI18n", () => {
  it("resolves uz start messages", () => {
    const i18n = createI18n();

    expect(i18n.t("start.welcome")).toContain("Assalomu alaykum");
    expect(i18n.t("start.openApp")).toBe("Taklifnoma yaratish");
  });

  it("resolves ru and en start messages instead of falling back to uz", () => {
    const i18n = createI18n();

    expect(i18n.t("start.welcome", { lng: "ru" })).toContain("Здравствуйте");
    expect(i18n.t("start.welcome", { lng: "en" })).toContain("Hello");
    expect(i18n.t("start.welcome", { lng: "ru" })).not.toBe(i18n.t("start.welcome", { lng: "uz" }));
    expect(i18n.t("start.welcome", { lng: "en" })).not.toBe(i18n.t("start.welcome", { lng: "uz" }));
  });

  it("still falls back to uz for a language with no resource file at all", () => {
    const i18n = createI18n();

    expect(i18n.t("start.welcome", { lng: "fr" })).toBe(i18n.t("start.welcome", { lng: "uz" }));
  });
});
