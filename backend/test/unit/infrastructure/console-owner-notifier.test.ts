import { describe, expect, it, vi } from "vitest";
import { ConsoleOwnerNotifier } from "../../../src/infrastructure/notifications/console-owner-notifier.js";

describe("ConsoleOwnerNotifier", () => {
  it("logs the chat id and guest name so a developer can see it locally", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const notifier = new ConsoleOwnerNotifier();

    await notifier.notifyNewRsvp(42n, {
      id: "rsvp-1",
      invitationId: "inv-1",
      guestName: "Aziza",
      status: "COMING",
      respondedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("42"));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Aziza"));
    logSpy.mockRestore();
  });
});
