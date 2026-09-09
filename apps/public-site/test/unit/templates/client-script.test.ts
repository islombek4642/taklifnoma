import { describe, expect, it } from "vitest";
import { renderClientScript } from "../../../src/templates/client-script.js";

const labels = {
  comingThankYou: "Rahmat!",
  notComingThankYou: "Rahmat, javobingiz uchun.",
  error: "Xatolik",
  nameRequired: "Ismingizni kiriting",
  alreadyRespondedComing: "Siz allaqachon \"Kelaman\" deb javob bergansiz.",
  alreadyRespondedNotComing: "Siz allaqachon \"Kelolmayman\" deb javob bergansiz.",
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

  it("sends a persisted guestToken and disables the buttons before the request goes out", () => {
    const script = renderClientScript("a-b", "2026-11-11T17:00:00.000Z", labels);

    expect(script).toContain("guestToken: getGuestToken()");
    expect(script).toContain("taklifnoma_guest_token");
    expect(script).toContain("setButtonsDisabled(true)");
  });

  it("submits directly from the form (Kelaman/Kelmayman are plain submit buttons)", () => {
    const script = renderClientScript("a-b", "2026-11-11T17:00:00.000Z", labels);

    expect(script).toContain('form.addEventListener("submit"');
    expect(script).not.toContain("data-rsvp-buttons");
  });

  it("shows the thank-you message in the modal after a successful submit", () => {
    const script = renderClientScript("a-b", "2026-11-11T17:00:00.000Z", labels);

    expect(script).toContain("function openThankYouModal(status)");
    expect(script).toContain("data-rsvp-modal-overlay");
    expect(script).toContain("data-rsvp-modal-message");
    expect(script).toContain(JSON.stringify(labels.comingThankYou));
    expect(script).toContain(JSON.stringify(labels.notComingThankYou));
  });

  it("persists this invitation's response status under a slug-scoped key", () => {
    const script = renderClientScript("a-b", "2026-11-11T17:00:00.000Z", labels);

    expect(script).toContain(JSON.stringify("taklifnoma_rsvp_status_a-b"));
  });

  it("shows the already-responded state (inline, not the modal) on load when a status was previously saved", () => {
    const script = renderClientScript("a-b", "2026-11-11T17:00:00.000Z", labels);

    expect(script).toContain("var savedStatus = getSavedStatus();");
    expect(script).toContain("if (savedStatus) showRespondedState(savedStatus);");
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

  it("only starts music playback from the toggle's click handler (never on its own)", () => {
    const script = renderClientScript("a-b", "2026-11-11T17:00:00.000Z", labels);

    expect(script.match(/musicAudio\.play\(\)/g)).toHaveLength(1);
    expect(script.indexOf("musicButton.addEventListener")).toBeLessThan(script.indexOf("musicAudio.play()"));
  });

  it("toggles the shared, template-agnostic playing class on the music button", () => {
    const script = renderClientScript("a-b", "2026-11-11T17:00:00.000Z", labels);

    expect(script).toContain('classList.add("taklifnoma-music-toggle--playing")');
    expect(script).toContain('classList.remove("taklifnoma-music-toggle--playing")');
  });
});
