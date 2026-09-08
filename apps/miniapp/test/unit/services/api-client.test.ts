import { afterEach, describe, expect, it, vi } from "vitest";
import { createApiClient, ApiError } from "../../../src/services/api-client.js";

const BASE_URL = "http://localhost:3000";

describe("createApiClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the tma-prefixed Authorization header on createInvitation", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "inv-1", slug: "a-b" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = createApiClient(BASE_URL);
    await client.createInvitation("raw-init-data", {
      groomName: "A",
      brideName: "B",
      eventDateTime: "2026-11-11T17:00:00.000Z",
      venueName: "V",
      venueAddress: "Addr",
      musicTrackId: "romantic-piano",
    });

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BASE_URL}/api/invitations`);
    expect((options.headers as Record<string, string>).authorization).toBe("tma raw-init-data");
  });

  it("returns null from getMyInvitation on a 404", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404, json: async () => ({}) }));

    const client = createApiClient(BASE_URL);

    expect(await client.getMyInvitation("init-data")).toBeNull();
  });

  it("throws ApiError with the response status for other failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({ error: "bad" }) }),
    );

    const client = createApiClient(BASE_URL);

    await expect(
      client.createInvitation("init-data", {
        groomName: "",
        brideName: "B",
        eventDateTime: "2026-11-11T17:00:00.000Z",
        venueName: "V",
        venueAddress: "Addr",
        musicTrackId: "romantic-piano",
      }),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it("lists guests", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => [{ id: "g-1", guestName: "Aziza", status: "COMING", respondedAt: "2026-01-01T00:00:00.000Z" }] }),
    );

    const client = createApiClient(BASE_URL);
    const guests = await client.listGuests("init-data");

    expect(guests).toHaveLength(1);
    expect(guests?.[0]?.guestName).toBe("Aziza");
  });

  it("returns null from listGuests on a 404 (owner has no invitation yet)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404, json: async () => ({}) }));

    const client = createApiClient(BASE_URL);

    expect(await client.listGuests("init-data")).toBeNull();
  });

  it("deletes the invitation", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    const client = createApiClient(BASE_URL);
    await client.deleteInvitation("init-data");

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BASE_URL}/api/invitations/me`);
    expect(options.method).toBe("DELETE");
  });
});
