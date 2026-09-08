import { describe, expect, it } from "vitest";
import { buildApp } from "../../../src/presentation/app.js";
import { InMemoryInvitationRepository } from "../../helpers/in-memory-invitation-repository.js";
import { InMemoryRsvpRepository } from "../../helpers/in-memory-rsvp-repository.js";
import { FakeOwnerNotifier } from "../../helpers/fake-owner-notifier.js";
import { InMemoryTemplateRegistry } from "../../helpers/in-memory-template-registry.js";
import { InMemoryMusicRegistry } from "../../helpers/in-memory-music-registry.js";

function buildTestApp() {
  return buildApp({
    invitationRepository: new InMemoryInvitationRepository(),
    rsvpRepository: new InMemoryRsvpRepository(),
    ownerNotifier: new FakeOwnerNotifier(),
    templateRegistry: new InMemoryTemplateRegistry(),
    musicRegistry: new InMemoryMusicRegistry(),
    contentDir: "/tmp/taklifnoma-test-content",
    botToken: "test-bot-token",
  });
}

describe("GET /api/templates", () => {
  it("returns the registered templates", async () => {
    const app = buildTestApp();

    const response = await app.inject({ method: "GET", url: "/api/templates" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([{ id: "classic", name: "Klassik", accentColor: "#b45d52", styleCss: "body { font-family: serif; }" }]);
  });
});

describe("GET /api/music-tracks", () => {
  it("returns the registered music tracks", async () => {
    const app = buildTestApp();

    const response = await app.inject({ method: "GET", url: "/api/music-tracks" });

    expect(response.statusCode).toBe(200);
    const tracks = response.json() as Array<{ id: string }>;
    expect(tracks.map((track) => track.id)).toEqual(["romantic-piano", "gentle-strings"]);
  });
});
