import { describe, expect, it } from "vitest";
import { createI18n } from "../../../src/i18n/i18n.js";
import { buildCommandMenu } from "../../../src/commands/command-menu.js";

describe("buildCommandMenu", () => {
  it("builds the /start and /help entries with translated descriptions", () => {
    const i18n = createI18n();

    const menu = buildCommandMenu(i18n.t.bind(i18n));

    expect(menu).toEqual([
      { command: "start", description: "Botni ishga tushirish" },
      { command: "help", description: "Yordam olish" },
    ]);
  });
});
