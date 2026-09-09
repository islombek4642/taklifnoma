import { describe, expect, it } from "vitest";
import { buildApp } from "../../../src/presentation/app.js";
import { InMemoryInvitationRepository } from "../../helpers/in-memory-invitation-repository.js";
import { InMemoryRsvpRepository } from "../../helpers/in-memory-rsvp-repository.js";
import { FakeOwnerNotifier } from "../../helpers/fake-owner-notifier.js";
import { InMemoryTemplateRegistry } from "../../helpers/in-memory-template-registry.js";
import { InMemoryMusicRegistry } from "../../helpers/in-memory-music-registry.js";

const BOT_TOKEN = "test-bot-token";

function buildTestApp() {
  return buildApp({
    invitationRepository: new InMemoryInvitationRepository(),
    rsvpRepository: new InMemoryRsvpRepository(),
    ownerNotifier: new FakeOwnerNotifier(),
    templateRegistry: new InMemoryTemplateRegistry(),
    musicRegistry: new InMemoryMusicRegistry(),
    contentDir: "/tmp/taklifnoma-test-content",
    botToken: BOT_TOKEN,
  });
}

const validPayload = { title: "Yangi kuy", fileBase64: Buffer.from("fake-audio-bytes").toString("base64"), fileExtension: "mp3" };

describe("POST /api/admin/music-tracks", () => {
  it("rejects a request with no Authorization header", async () => {
    const app = buildTestApp();

    const response = await app.inject({ method: "POST", url: "/api/admin/music-tracks", payload: validPayload });

    expect(response.statusCode).toBe(401);
  });

  it("rejects a request with the wrong bearer token", async () => {
    const app = buildTestApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/admin/music-tracks",
      headers: { authorization: "Bearer wrong-token" },
      payload: validPayload,
    });

    expect(response.statusCode).toBe(401);
  });

  it("creates a track and makes it immediately visible via GET /api/music-tracks", async () => {
    const app = buildTestApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/admin/music-tracks",
      headers: { authorization: `Bearer ${BOT_TOKEN}` },
      payload: validPayload,
    });

    expect(response.statusCode).toBe(201);
    const created = response.json() as { id: string; title: string; fileUrl: string };
    expect(created.title).toBe("Yangi kuy");

    const list = await app.inject({ method: "GET", url: "/api/music-tracks" });
    expect((list.json() as Array<{ id: string }>).map((t) => t.id)).toContain(created.id);
  });

  it("rejects a missing title", async () => {
    const app = buildTestApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/admin/music-tracks",
      headers: { authorization: `Bearer ${BOT_TOKEN}` },
      payload: { ...validPayload, title: "" },
    });

    expect(response.statusCode).toBe(400);
  });

  it("rejects a disallowed file extension", async () => {
    const app = buildTestApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/admin/music-tracks",
      headers: { authorization: `Bearer ${BOT_TOKEN}` },
      payload: { ...validPayload, fileExtension: "exe" },
    });

    expect(response.statusCode).toBe(400);
  });

  it("rejects an empty file", async () => {
    const app = buildTestApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/admin/music-tracks",
      headers: { authorization: `Bearer ${BOT_TOKEN}` },
      payload: { ...validPayload, fileBase64: "" },
    });

    expect(response.statusCode).toBe(400);
  });
});
