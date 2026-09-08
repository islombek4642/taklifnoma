import { describe, expect, it } from "vitest";
import { buildApp } from "../../../src/presentation/app.js";
import { InMemoryInvitationRepository } from "../../helpers/in-memory-invitation-repository.js";
import { InMemoryRsvpRepository } from "../../helpers/in-memory-rsvp-repository.js";
import { FakeOwnerNotifier } from "../../helpers/fake-owner-notifier.js";

function buildTestApp() {
  return buildApp({
    invitationRepository: new InMemoryInvitationRepository(),
    rsvpRepository: new InMemoryRsvpRepository(),
    ownerNotifier: new FakeOwnerNotifier(),
    botToken: "test-bot-token",
  });
}

describe("CORS", () => {
  it("allows the Mini App's configured origin to call a protected route, including preflight", async () => {
    const app = buildApp({
      invitationRepository: new InMemoryInvitationRepository(),
      rsvpRepository: new InMemoryRsvpRepository(),
      ownerNotifier: new FakeOwnerNotifier(),
      botToken: "test-bot-token",
      corsOrigin: "https://app.example.com",
    });

    const preflight = await app.inject({
      method: "OPTIONS",
      url: "/api/invitations/me",
      headers: {
        origin: "https://app.example.com",
        "access-control-request-method": "GET",
        "access-control-request-headers": "authorization",
      },
    });
    expect(preflight.statusCode).toBe(204);
    expect(preflight.headers["access-control-allow-origin"]).toBe("https://app.example.com");

    const actual = await app.inject({
      method: "GET",
      url: "/api/invitations/me",
      headers: { origin: "https://app.example.com" },
    });
    expect(actual.headers["access-control-allow-origin"]).toBe("https://app.example.com");
  });
});

describe("GET /health", () => {
  it("returns 200 with an ok status, for Docker healthchecks", async () => {
    const app = buildTestApp();

    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });
});

describe("app error handling", () => {
  it("returns 401 when the Authorization header is missing on a protected route", async () => {
    const app = buildTestApp();

    const response = await app.inject({ method: "GET", url: "/api/invitations/me" });

    expect(response.statusCode).toBe(401);
  });

  it("returns 404 with a JSON body for an unknown public invitation", async () => {
    const app = buildTestApp();

    const response = await app.inject({ method: "GET", url: "/api/public/invitations/unknown-slug" });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: "Invitation not found" });
  });
});
