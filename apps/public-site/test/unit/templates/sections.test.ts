import { describe, expect, it } from "vitest";
import { createI18n } from "../../../src/i18n/i18n.js";
import { renderHeroSection } from "../../../src/templates/sections/hero.js";
import { renderCountdownSection } from "../../../src/templates/sections/countdown.js";
import { renderVenueSection } from "../../../src/templates/sections/venue.js";
import { renderRsvpSection } from "../../../src/templates/sections/rsvp.js";
import { renderMusicSection } from "../../../src/templates/sections/music.js";
import type { PublicInvitationDto } from "../../../src/services/backend-api-client.js";

const i18n = createI18n();
const t = i18n.t.bind(i18n);

const baseInvitation: PublicInvitationDto = {
  id: "inv-1",
  slug: "ulugbek-malika",
  groomName: "Ulug'bek",
  brideName: "Malika",
  eventDateTime: "2026-11-11T17:00:00.000Z",
  venueName: "Baxtiyor restorani",
  venueAddress: "Toshkent",
  mapUrl: "https://maps.google.com/?q=1,2",
  greetingText: null,
  musicTrackId: "romantic-piano",
};

describe("renderHeroSection", () => {
  it("escapes HTML in the groom and bride names", () => {
    const html = renderHeroSection({ ...baseInvitation, groomName: "<script>alert(1)</script>" }, t);

    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("falls back to the default greeting when greetingText is null", () => {
    expect(renderHeroSection(baseInvitation, t)).toContain("Sizni to&#39;y marosimimizga taklif qilamiz!");
  });
});

describe("renderCountdownSection", () => {
  it("includes data hooks for each unit the client script updates", () => {
    const html = renderCountdownSection(baseInvitation, t);

    for (const unit of ["days", "hours", "minutes", "seconds"]) {
      expect(html).toContain(`data-countdown="${unit}"`);
    }
  });
});

describe("renderVenueSection", () => {
  it("renders a map link for a safe https mapUrl", () => {
    expect(renderVenueSection(baseInvitation, t)).toContain('href="https://maps.google.com/?q=1,2"');
  });

  it("omits the map link entirely for an unsafe mapUrl", () => {
    const html = renderVenueSection({ ...baseInvitation, mapUrl: "javascript:alert(1)" }, t);

    expect(html).not.toContain("javascript:");
  });

  it("renders no map link when mapUrl is null", () => {
    expect(renderVenueSection({ ...baseInvitation, mapUrl: null }, t)).not.toContain("<a ");
  });
});

describe("renderRsvpSection", () => {
  it("includes the form data hook and both status buttons", () => {
    const html = renderRsvpSection(t);

    expect(html).toContain("data-rsvp-form");
    expect(html).toContain('data-status="COMING"');
    expect(html).toContain('data-status="NOT_COMING"');
  });
});

describe("renderMusicSection", () => {
  it("renders the toggle and audio element for a known track", () => {
    const html = renderMusicSection(baseInvitation, t);

    expect(html).toContain("data-music-toggle");
    expect(html).toContain("data-music-audio");
  });

  it("renders nothing for an unknown musicTrackId", () => {
    expect(renderMusicSection({ ...baseInvitation, musicTrackId: "unknown" }, t)).toBe("");
  });
});
