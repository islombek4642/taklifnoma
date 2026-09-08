import { describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { FakeBackendApiClient } from "../helpers/fake-backend-api-client.js";
import type { PublicInvitationDto } from "../../src/services/backend-api-client.js";

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
  musicTrackId: "romantic-piano",
};

describe("GET /health", () => {
  it("returns 200 with an ok status, for Docker healthchecks, without falling through to the :slug route", async () => {
    const app = buildApp({ backendApiClient: new FakeBackendApiClient() });

    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });
});

describe("GET /:slug", () => {
  it("renders the invitation page for a known slug", async () => {
    const backendApiClient = new FakeBackendApiClient();
    backendApiClient.seedInvitation(invitation);
    const app = buildApp({ backendApiClient });

    const response = await app.inject({ method: "GET", url: "/ulugbek-malika" });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.body).toContain("Ulug&#39;bek");
  });

  it("returns 404 with the not-found page for an unknown slug", async () => {
    const app = buildApp({ backendApiClient: new FakeBackendApiClient() });

    const response = await app.inject({ method: "GET", url: "/unknown-slug" });

    expect(response.statusCode).toBe(404);
    expect(response.body).toContain("Taklifnoma topilmadi");
  });
});

describe("POST /:slug/rsvp", () => {
  it("proxies a successful RSVP submission to the backend", async () => {
    const backendApiClient = new FakeBackendApiClient();
    backendApiClient.seedInvitation(invitation);
    const app = buildApp({ backendApiClient });

    const response = await app.inject({
      method: "POST",
      url: "/ulugbek-malika/rsvp",
      headers: { "content-type": "application/json" },
      payload: { guestName: "Aziza", status: "COMING" },
    });

    expect(response.statusCode).toBe(201);
    expect(backendApiClient.submittedRsvps).toEqual([
      { slug: "ulugbek-malika", input: { guestName: "Aziza", status: "COMING" } },
    ]);
  });

  it("relays the backend's error status and body on failure", async () => {
    const backendApiClient = new FakeBackendApiClient();
    backendApiClient.rsvpFailure = { status: 429, body: { error: "Too many requests" } };
    const app = buildApp({ backendApiClient });

    const response = await app.inject({
      method: "POST",
      url: "/ulugbek-malika/rsvp",
      headers: { "content-type": "application/json" },
      payload: { guestName: "Aziza", status: "COMING" },
    });

    expect(response.statusCode).toBe(429);
    expect(response.json()).toEqual({ error: "Too many requests" });
  });
});
