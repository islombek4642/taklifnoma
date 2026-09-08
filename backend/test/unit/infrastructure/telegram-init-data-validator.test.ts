import { describe, expect, it } from "vitest";
import { validateTelegramInitData } from "../../../src/infrastructure/auth/telegram-init-data-validator.js";
import { signInitData } from "../../helpers/sign-init-data.js";

const BOT_TOKEN = "test-bot-token";

describe("validateTelegramInitData", () => {
  it("accepts data signed with the matching bot token", () => {
    const initData = signInitData(BOT_TOKEN, {
      auth_date: String(Math.floor(Date.now() / 1000)),
      user: JSON.stringify({ id: 12345 }),
    });

    const result = validateTelegramInitData(initData, BOT_TOKEN);

    expect(result.isValid).toBe(true);
    expect(result.telegramId).toBe(12345n);
  });

  it("rejects data signed with a different bot token", () => {
    const initData = signInitData("other-token", {
      auth_date: String(Math.floor(Date.now() / 1000)),
      user: JSON.stringify({ id: 12345 }),
    });

    expect(validateTelegramInitData(initData, BOT_TOKEN).isValid).toBe(false);
  });

  it("rejects tampered fields", () => {
    const initData = signInitData(BOT_TOKEN, {
      auth_date: String(Math.floor(Date.now() / 1000)),
      user: JSON.stringify({ id: 12345 }),
    });
    const tampered = initData.replace("12345", "99999");

    expect(validateTelegramInitData(tampered, BOT_TOKEN).isValid).toBe(false);
  });

  it("rejects data older than the configured max age", () => {
    const oneWeekAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
    const initData = signInitData(BOT_TOKEN, {
      auth_date: String(oneWeekAgo),
      user: JSON.stringify({ id: 12345 }),
    });

    expect(validateTelegramInitData(initData, BOT_TOKEN).isValid).toBe(false);
  });
});
