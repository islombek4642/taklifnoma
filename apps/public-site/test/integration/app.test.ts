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
  templateId: "classic",
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

describe("GET /media/music/:id/:file", () => {
  it("proxies the audio bytes from the backend", async () => {
    const app = buildApp({ backendApiClient: new FakeBackendApiClient() });

    const response = await app.inject({ method: "GET", url: "/media/music/romantic-piano/track.wav" });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toBe("audio/wav");
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
    expect(response.body).toContain("body { font-family: serif; }");
    expect(response.body).toContain('src="/media/music/romantic-piano/track.wav"');
    expect(response.headers["cache-control"]).toBe("no-store");
  });

  it("falls back to a default style when the invitation's template isn't registered", async () => {
    const backendApiClient = new FakeBackendApiClient();
    backendApiClient.seedInvitation({ ...invitation, templateId: "unknown-template" });
    const app = buildApp({ backendApiClient });

    const response = await app.inject({ method: "GET", url: "/ulugbek-malika" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain(".music-toggle");
  });

  it("returns 404 with the not-found page for an unknown slug", async () => {
    const app = buildApp({ backendApiClient: new FakeBackendApiClient() });

    const response = await app.inject({ method: "GET", url: "/unknown-slug" });

    expect(response.statusCode).toBe(404);
    expect(response.body).toContain("Taklifnoma topilmadi");
    expect(response.headers["cache-control"]).toBe("no-store");
  });
});

describe("GET /preview/:templateId", () => {
  it("renders a sample invitation styled with the requested template, in preview mode", async () => {
    const backendApiClient = new FakeBackendApiClient();
    const app = buildApp({ backendApiClient });

    const response = await app.inject({ method: "GET", url: "/preview/classic" });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.body).toContain("body { font-family: serif; }");
    expect(response.body).toContain("taklifnoma-preview-badge");
    expect(response.body).toContain("var previewMode = true;");
  });

  it("returns 404 for a template that isn't registered", async () => {
    const backendApiClient = new FakeBackendApiClient();
    const app = buildApp({ backendApiClient });

    const response = await app.inject({ method: "GET", url: "/preview/unknown-template" });

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

  it("forwards the guestToken to the backend when the client sends one", async () => {
    const backendApiClient = new FakeBackendApiClient();
    backendApiClient.seedInvitation(invitation);
    const app = buildApp({ backendApiClient });

    await app.inject({
      method: "POST",
      url: "/ulugbek-malika/rsvp",
      headers: { "content-type": "application/json" },
      payload: { guestName: "Aziza", status: "COMING", guestToken: "guest-1" },
    });

    expect(backendApiClient.submittedRsvps).toEqual([
      { slug: "ulugbek-malika", input: { guestName: "Aziza", status: "COMING", guestToken: "guest-1" } },
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
