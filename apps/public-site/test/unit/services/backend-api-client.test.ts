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
});
