import { afterEach, describe, expect, it, vi } from "vitest";
import { TelegramOwnerNotifier } from "../../../src/infrastructure/notifications/telegram-owner-notifier.js";

describe("TelegramOwnerNotifier", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls the Telegram sendMessage API with the chat id and RSVP details", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    const notifier = new TelegramOwnerNotifier("test-bot-token");
    await notifier.notifyNewRsvp(42n, {
      id: "rsvp-1",
      invitationId: "inv-1",
      guestName: "Aziza",
      status: "COMING",
      respondedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.telegram.org/bottest-bot-token/sendMessage");
    const body = JSON.parse(options.body as string) as { chat_id: string; text: string };
    expect(body.chat_id).toBe("42");
    expect(body.text).toContain("Aziza");
  });

  it("does not throw when the Telegram API call fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const notifier = new TelegramOwnerNotifier("test-bot-token");

    await expect(
      notifier.notifyNewRsvp(1n, {
        id: "rsvp-2",
        invitationId: "inv-1",
        guestName: "Bek",
        status: "NOT_COMING",
        respondedAt: new Date("2026-01-01T00:00:00.000Z"),
      }),
    ).resolves.toBeUndefined();

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
