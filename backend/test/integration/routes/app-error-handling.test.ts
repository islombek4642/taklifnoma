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
