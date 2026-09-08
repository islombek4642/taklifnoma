import { describe, expect, it } from "vitest";
import { renderClientScript } from "../../../src/templates/client-script.js";

describe("renderClientScript", () => {
  it("produces syntactically valid JavaScript", () => {
    const script = renderClientScript("a-b", "2026-11-11T17:00:00.000Z", {
      comingThankYou: "Rahmat!",
      notComingThankYou: "Rahmat, javobingiz uchun.",
      error: "Xatolik",
      nameRequired: "Ismingizni kiriting",
    });

    expect(() => new Function(script)).not.toThrow();
  });

  it("embeds the slug, event date, and labels safely via JSON.stringify", () => {
    const script = renderClientScript("a-b", "2026-11-11T17:00:00.000Z", {
      comingThankYou: "Rahmat!",
      notComingThankYou: "Rahmat, javobingiz uchun.",
      error: "Xatolik",
      nameRequired: "Ismingizni kiriting",
    });

    expect(script).toContain(JSON.stringify("/a-b/rsvp"));
    expect(script).toContain(JSON.stringify("2026-11-11T17:00:00.000Z"));
    expect(script).toContain(JSON.stringify("Rahmat!"));
  });
});
