import { describe, expect, it } from "vitest";
import { createI18n } from "../../../src/i18n/i18n.js";
import { buildHelpMessage } from "../../../src/commands/help.js";

describe("buildHelpMessage", () => {
  it("returns help text mentioning both commands", () => {
    const i18n = createI18n();

    const message = buildHelpMessage(i18n.t.bind(i18n));

    expect(message).toContain("/start");
    expect(message).toContain("/help");
  });
});
