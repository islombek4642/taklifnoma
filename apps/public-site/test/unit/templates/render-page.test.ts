import { describe, expect, it } from "vitest";
import { createI18n } from "../../../src/i18n/i18n.js";
import { renderInvitationPage } from "../../../src/templates/render-page.js";
import { renderNotFoundPage } from "../../../src/templates/render-not-found.js";
import type { PublicInvitationDto } from "../../../src/services/backend-api-client.js";

const i18n = createI18n();
const t = i18n.t.bind(i18n);

const invitation: PublicInvitationDto = {
  id: "inv-1",
  slug: "ulugbek-malika",
  groomName: "Ulug'bek",
  brideName: "Malika",
  eventDateTime: "2026-11-11T17:00:00.000Z",
  venueName: "Baxtiyor restorani",
  venueAddress: "Toshkent",
  mapUrl: null,
  greetingText: null,
  templateId: "classic",
  musicTrackId: "romantic-piano",
};

describe("renderInvitationPage", () => {
  it("includes an escaped title, the given style, all sections, and the inline client script", () => {
    const html = renderInvitationPage(invitation, t, "body { color: blue; }", "/media/music/romantic-piano/track.wav");

    expect(html).toContain("<title>Ulug&#39;bek &amp; Malika");
    expect(html).toContain("<style>body { color: blue; }</style>");
    expect(html).toContain('class="hero"');
    expect(html).toContain('class="countdown"');
    expect(html).toContain('class="venue"');
    expect(html).toContain('data-rsvp-form');
    expect(html).toContain("data-music-toggle");
    expect(html).toContain(JSON.stringify("/ulugbek-malika/rsvp"));
  });

  it("always inlines the shared premium RSVP modal styles, regardless of the active template", () => {
    const html = renderInvitationPage(invitation, t, "body { color: blue; }", undefined);

    expect(html).toContain("taklifnoma-modal-overlay");
    expect(html).toContain("taklifnoma-modal__ornament");
    expect(html).toContain("data-rsvp-modal-overlay");
  });

  it("omits the preview badge and preview mode by default", () => {
    const html = renderInvitationPage(invitation, t, "body { color: blue; }", undefined);

    expect(html).not.toContain("taklifnoma-preview-badge");
    expect(html).toContain("var previewMode = false;");
  });

  it("shows a preview badge and enables preview mode when requested", () => {
    const html = renderInvitationPage(invitation, t, "body { color: blue; }", undefined, { previewMode: true });

    expect(html).toContain("taklifnoma-preview-badge");
    expect(html).toContain("var previewMode = true;");
  });

  it("omits the music section when no track file url is given", () => {
    const html = renderInvitationPage(invitation, t, "", undefined);

    expect(html).not.toContain("<audio");
    expect(html).not.toContain('<button class="taklifnoma-music-toggle"');
  });

  it("always inlines the shared music toggle's wave-bar style, regardless of the active template", () => {
    const html = renderInvitationPage(invitation, t, "body { color: blue; }", undefined);

    expect(html).toContain("taklifnoma-music-toggle__wave");
    expect(html).toContain("taklifnoma-music-wave");
  });
});

describe("renderNotFoundPage", () => {
  it("renders the not-found title", () => {
    expect(renderNotFoundPage(t)).toContain("Taklifnoma topilmadi");
  });
});
