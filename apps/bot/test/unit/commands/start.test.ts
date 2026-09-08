import { describe, expect, it } from "vitest";
import { createI18n } from "../../../src/i18n/i18n.js";
import { buildStartMessage, buildStartKeyboard } from "../../../src/commands/start.js";

describe("buildStartMessage", () => {
  it("returns the welcome text for the given translator", () => {
    const i18n = createI18n();

    expect(buildStartMessage(i18n.t.bind(i18n))).toContain("Assalomu alaykum");
  });
});

describe("buildStartKeyboard", () => {
  it("builds a single web_app button pointing at the Mini App URL", () => {
    const i18n = createI18n();

    const keyboard = buildStartKeyboard("https://example.com/app", i18n.t.bind(i18n));

    const button = keyboard.inline_keyboard[0]?.[0];
    expect(button?.text).toBe("Taklifnoma yaratish");
    expect(button && "web_app" in button ? button.web_app.url : undefined).toBe("https://example.com/app");
  });
});
