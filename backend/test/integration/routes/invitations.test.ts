import { describe, expect, it } from "vitest";
import { buildApp } from "../../../src/presentation/app.js";
import { InMemoryInvitationRepository } from "../../helpers/in-memory-invitation-repository.js";
import { InMemoryRsvpRepository } from "../../helpers/in-memory-rsvp-repository.js";
import { FakeOwnerNotifier } from "../../helpers/fake-owner-notifier.js";
import { signInitData } from "../../helpers/sign-init-data.js";

const BOT_TOKEN = "test-bot-token";

function authHeader(telegramId: number) {
  const initData = signInitData(BOT_TOKEN, {
    auth_date: String(Math.floor(Date.now() / 1000)),
    user: JSON.stringify({ id: telegramId }),
  });
  return `tma ${initData}`;
}

function buildTestApp() {
  return buildApp({
    invitationRepository: new InMemoryInvitationRepository(),
    rsvpRepository: new InMemoryRsvpRepository(),
    ownerNotifier: new FakeOwnerNotifier(),
    botToken: BOT_TOKEN,
  });
}

const validPayload = {
  groomName: "Ulug'bek",
  brideName: "Malika",
  eventDateTime: "2026-11-11T17:00:00.000Z",
  venueName: "Baxtiyor restorani",
  venueAddress: "Toshkent viloyati",
  musicTrackId: "romantic-piano",
};

describe("POST /api/invitations", () => {
  it("creates an invitation and returns 201 with a JSON-safe body", async () => {
    const app = buildTestApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/invitations",
      headers: { authorization: authHeader(1), "content-type": "application/json" },
      payload: validPayload,
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.slug).toBe("ulugbek-malika");
    expect(typeof body.ownerTelegramId).toBe("string");
  });

  it("returns 400 for invalid input", async () => {
    const app = buildTestApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/invitations",
      headers: { authorization: authHeader(1), "content-type": "application/json" },
      payload: { ...validPayload, groomName: "" },
    });

    expect(response.statusCode).toBe(400);
  });
});

describe("GET/PUT /api/invitations/me", () => {
  it("returns the owner's invitation after creation, and updates it", async () => {
    const app = buildTestApp();
    await app.inject({
      method: "POST",
      url: "/api/invitations",
      headers: { authorization: authHeader(2), "content-type": "application/json" },
      payload: validPayload,
    });

    const getResponse = await app.inject({
      method: "GET",
      url: "/api/invitations/me",
      headers: { authorization: authHeader(2) },
    });
    expect(getResponse.json().venueName).toBe("Baxtiyor restorani");

    const putResponse = await app.inject({
      method: "PUT",
      url: "/api/invitations/me",
      headers: { authorization: authHeader(2), "content-type": "application/json" },
      payload: { venueName: "New Hall" },
    });
    expect(putResponse.json().venueName).toBe("New Hall");
  });
});

describe("GET /api/invitations/me/guests", () => {
  it("returns an empty array when nobody has responded yet", async () => {
    const app = buildTestApp();
    await app.inject({
      method: "POST",
      url: "/api/invitations",
      headers: { authorization: authHeader(3), "content-type": "application/json" },
      payload: validPayload,
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/invitations/me/guests",
      headers: { authorization: authHeader(3) },
    });

    expect(response.json()).toEqual([]);
  });
});
