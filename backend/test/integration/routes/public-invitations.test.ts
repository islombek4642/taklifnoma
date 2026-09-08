import { describe, expect, it } from "vitest";
import { buildApp } from "../../../src/presentation/app.js";
import { InMemoryInvitationRepository } from "../../helpers/in-memory-invitation-repository.js";
import { InMemoryRsvpRepository } from "../../helpers/in-memory-rsvp-repository.js";
import { FakeOwnerNotifier } from "../../helpers/fake-owner-notifier.js";

const baseInvitation = {
  groomName: "Ulug'bek",
  brideName: "Malika",
  eventDateTime: new Date("2026-11-11T17:00:00.000Z"),
  venueName: "Baxtiyor restorani",
  venueAddress: "Toshkent viloyati",
  musicTrackId: "romantic-piano",
  slug: "ulugbek-malika",
  ownerTelegramId: 1n,
  ownerChatId: 1n,
};

function buildTestApp(invitationRepository: InMemoryInvitationRepository, notifier: FakeOwnerNotifier) {
  return buildApp({
    invitationRepository,
    rsvpRepository: new InMemoryRsvpRepository(),
    ownerNotifier: notifier,
    botToken: "test-bot-token",
  });
}

describe("GET /api/public/invitations/:slug", () => {
  it("returns the invitation without exposing owner ids as numbers", async () => {
    const invitations = new InMemoryInvitationRepository();
    await invitations.create(baseInvitation);
    const app = buildTestApp(invitations, new FakeOwnerNotifier());

    const response = await app.inject({ method: "GET", url: "/api/public/invitations/ulugbek-malika" });

    expect(response.statusCode).toBe(200);
    expect(response.json().groomName).toBe("Ulug'bek");
  });

  it("returns 404 for an unknown slug", async () => {
    const app = buildTestApp(new InMemoryInvitationRepository(), new FakeOwnerNotifier());

    const response = await app.inject({ method: "GET", url: "/api/public/invitations/unknown" });

    expect(response.statusCode).toBe(404);
  });
});

describe("POST /api/public/invitations/:slug/rsvp", () => {
  it("stores the RSVP and notifies the owner", async () => {
    const invitations = new InMemoryInvitationRepository();
    await invitations.create(baseInvitation);
    const notifier = new FakeOwnerNotifier();
    const app = buildTestApp(invitations, notifier);

    const response = await app.inject({
      method: "POST",
      url: "/api/public/invitations/ulugbek-malika/rsvp",
      headers: { "content-type": "application/json" },
      payload: { guestName: "Aziza", status: "COMING" },
    });

    expect(response.statusCode).toBe(201);
    expect(notifier.notifications).toHaveLength(1);
  });

  it("returns 429 after exceeding the per-IP rate limit", async () => {
    const invitations = new InMemoryInvitationRepository();
    await invitations.create(baseInvitation);
    const app = buildTestApp(invitations, new FakeOwnerNotifier());
    const limit = 5;

    for (let i = 0; i < limit; i += 1) {
      await app.inject({
        method: "POST",
        url: "/api/public/invitations/ulugbek-malika/rsvp",
        headers: { "content-type": "application/json", "x-forwarded-for": "9.9.9.9" },
        payload: { guestName: `Guest ${i}`, status: "COMING" },
      });
    }

    const response = await app.inject({
      method: "POST",
      url: "/api/public/invitations/ulugbek-malika/rsvp",
      headers: { "content-type": "application/json", "x-forwarded-for": "9.9.9.9" },
      payload: { guestName: "One too many", status: "COMING" },
    });

    expect(response.statusCode).toBe(429);
  });
});
