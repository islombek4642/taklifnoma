import { describe, expect, it } from "vitest";
import { renderClientScript } from "../../../src/templates/client-script.js";

const labels = {
  comingThankYou: "Rahmat!",
  notComingThankYou: "Rahmat, javobingiz uchun.",
  error: "Xatolik",
  nameRequired: "Ismingizni kiriting",
  alreadyRespondedComing: "Siz allaqachon \"Kelaman\" deb javob bergansiz.",
  alreadyRespondedNotComing: "Siz allaqachon \"Kelolmayman\" deb javob bergansiz.",
  modalComingTitle: "Kelishingizni tasdiqlaysizmi?",
  modalNotComingTitle: "Kelolmasligingizni tasdiqlaysizmi?",
};

describe("renderClientScript", () => {
  it("produces syntactically valid JavaScript", () => {
    const script = renderClientScript("a-b", "2026-11-11T17:00:00.000Z", labels);

    expect(() => new Function(script)).not.toThrow();
  });

  it("embeds the slug, event date, and labels safely via JSON.stringify", () => {
    const script = renderClientScript("a-b", "2026-11-11T17:00:00.000Z", labels);

    expect(script).toContain(JSON.stringify("/a-b/rsvp"));
    expect(script).toContain(JSON.stringify("2026-11-11T17:00:00.000Z"));
    expect(script).toContain(JSON.stringify("Rahmat!"));
  });

  it("sends a persisted guestToken and disables the form before the request goes out", () => {
    const script = renderClientScript("a-b", "2026-11-11T17:00:00.000Z", labels);

    expect(script).toContain("guestToken: getGuestToken()");
    expect(script).toContain("taklifnoma_guest_token");
    expect(script).toContain("setFormDisabled(true)");
  });

  it("opens a status-specific modal instead of submitting directly from the trigger buttons", () => {
    const script = renderClientScript("a-b", "2026-11-11T17:00:00.000Z", labels);

    expect(script).toContain("function openModal(status)");
    expect(script).toContain("data-rsvp-modal-overlay");
    expect(script).toContain(JSON.stringify(labels.modalComingTitle));
    expect(script).toContain(JSON.stringify(labels.modalNotComingTitle));
  });

  it("persists this invitation's response status under a slug-scoped key", () => {
    const script = renderClientScript("a-b", "2026-11-11T17:00:00.000Z", labels);

    expect(script).toContain(JSON.stringify("taklifnoma_rsvp_status_a-b"));
  });

  it("shows the already-responded state on load when a status was previously saved", () => {
    const script = renderClientScript("a-b", "2026-11-11T17:00:00.000Z", labels);

    expect(script).toContain("var savedStatus = getSavedStatus();");
    expect(script).toContain("if (savedStatus) showRespondedState(savedStatus, false);");
    expect(script).toContain(JSON.stringify(labels.alreadyRespondedComing));
    expect(script).toContain(JSON.stringify(labels.alreadyRespondedNotComing));
  });

  it("defaults to non-preview mode when no options are given", () => {
    const script = renderClientScript("a-b", "2026-11-11T17:00:00.000Z", labels);

    expect(script).toContain("var previewMode = false;");
  });

  it("in preview mode, skips the network request and simulates success locally on submit", () => {
    const script = renderClientScript("a-b", "2026-11-11T17:00:00.000Z", labels, { previewMode: true });

    expect(() => new Function(script)).not.toThrow();
    expect(script).toContain("var previewMode = true;");
    expect(script).toContain("if (previewMode) {");
    expect(script.indexOf("if (previewMode) {")).toBeLessThan(script.indexOf("fetch("));
  });
});
