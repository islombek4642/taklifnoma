import { describe, expect, it } from "vitest";
import { createI18n } from "../../../src/i18n/i18n.js";
import { buildMenuButton } from "../../../src/commands/menu-button.js";

describe("buildMenuButton", () => {
  it("builds a web_app menu button pointing at the Mini App URL", () => {
    const i18n = createI18n();

    const menuButton = buildMenuButton(i18n.t.bind(i18n), "https://app.example.com");

    expect(menuButton).toEqual({
      type: "web_app",
      text: "Taklifnoma yaratish",
      web_app: { url: "https://app.example.com" },
    });
  });
});
