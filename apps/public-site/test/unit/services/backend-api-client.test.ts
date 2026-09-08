import { afterEach, describe, expect, it, vi } from "vitest";
import { createBackendApiClient, RsvpSubmissionError } from "../../../src/services/backend-api-client.js";

const BASE_URL = "http://localhost:3000";

describe("createBackendApiClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches an invitation by slug", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ slug: "a-b", groomName: "A" }) }),
    );

    const client = createBackendApiClient(BASE_URL);
    const invitation = await client.getInvitationBySlug("a-b");

    expect(invitation?.groomName).toBe("A");
  });

  it("returns null for an unknown slug", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404, json: async () => ({}) }));

    const client = createBackendApiClient(BASE_URL);

    expect(await client.getInvitationBySlug("unknown")).toBeNull();
  });

  it("posts the RSVP to the correct URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({ id: "r-1", status: "COMING" }) });
    vi.stubGlobal("fetch", fetchMock);

    const client = createBackendApiClient(BASE_URL);
    await client.submitRsvp("a-b", { guestName: "Aziza", status: "COMING" });

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BASE_URL}/api/public/invitations/a-b/rsvp`);
    expect(JSON.parse(options.body as string)).toEqual({ guestName: "Aziza", status: "COMING" });
  });

  it("throws RsvpSubmissionError carrying the backend's status and body on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({ error: "Too many requests" }) }),
    );

    const client = createBackendApiClient(BASE_URL);

    await expect(client.submitRsvp("a-b", { guestName: "Aziza", status: "COMING" })).rejects.toBeInstanceOf(
      RsvpSubmissionError,
    );
  });

  it("fetches templates from the backend", async () => {
    const templates = [{ id: "classic", name: "Klassik", accentColor: "#b45d52", styleCss: "body{}" }];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => templates }));

    const client = createBackendApiClient(BASE_URL);

    expect(await client.getTemplates()).toEqual(templates);
  });

  it("returns an empty template list when the backend request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }));

    const client = createBackendApiClient(BASE_URL);

    expect(await client.getTemplates()).toEqual([]);
  });

  it("fetches music tracks from the backend", async () => {
    const tracks = [{ id: "romantic-piano", title: "Romantik pianino", fileUrl: "/media/music/romantic-piano/track.wav" }];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => tracks }));

    const client = createBackendApiClient(BASE_URL);

    expect(await client.getMusicTracks()).toEqual(tracks);
  });

  it("fetches media bytes with their content type", async () => {
    const body = new ArrayBuffer(4);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, headers: { get: () => "audio/wav" }, arrayBuffer: async () => body }),
    );

    const client = createBackendApiClient(BASE_URL);

    expect(await client.fetchMedia("/media/music/romantic-piano/track.wav")).toEqual({ contentType: "audio/wav", body });
  });

  it("returns null for media when the backend request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));

    const client = createBackendApiClient(BASE_URL);

    expect(await client.fetchMedia("/media/music/unknown/track.wav")).toBeNull();
  });
});
