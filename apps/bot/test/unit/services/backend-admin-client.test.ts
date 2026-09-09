import { afterEach, describe, expect, it, vi } from "vitest";
import { BackendAdminError, createBackendAdminClient } from "../../../src/services/backend-admin-client.js";

const BASE_URL = "http://backend:3000";
const BOT_TOKEN = "test-bot-token";

describe("createBackendAdminClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the title, extension, and base64-encoded bytes with a bearer auth header", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "track-1", title: "Yangi kuy", fileUrl: "/media/music/track-1/track.mp3" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = createBackendAdminClient(BASE_URL, BOT_TOKEN);
    const track = await client.createMusicTrack("Yangi kuy", new Uint8Array([1, 2, 3]), "mp3");

    expect(track).toEqual({ id: "track-1", title: "Yangi kuy", fileUrl: "/media/music/track-1/track.mp3" });
    const [url, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BASE_URL}/api/admin/music-tracks`);
    expect(requestInit.headers).toMatchObject({ authorization: `Bearer ${BOT_TOKEN}` });
    const body = JSON.parse(requestInit.body as string) as { title: string; fileExtension: string; fileBase64: string };
    expect(body.title).toBe("Yangi kuy");
    expect(body.fileExtension).toBe("mp3");
    expect(Buffer.from(body.fileBase64, "base64")).toEqual(Buffer.from([1, 2, 3]));
  });

  it("throws BackendAdminError carrying the status and body on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({ error: "Sarlavha talab qilinadi" }) }),
    );

    const client = createBackendAdminClient(BASE_URL, BOT_TOKEN);

    await expect(client.createMusicTrack("", new Uint8Array(), "mp3")).rejects.toBeInstanceOf(BackendAdminError);
  });
});
