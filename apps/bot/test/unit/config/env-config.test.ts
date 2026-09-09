import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadEnvConfig } from "../../../src/config/env-config.js";

const ORIGINAL_ENV = { ...process.env };

function setRequiredEnv() {
  process.env.TELEGRAM_BOT_TOKEN = "test-token";
  process.env.MINIAPP_URL = "https://example.com/app";
  process.env.BACKEND_API_BASE_URL = "https://api.example.com";
}

describe("loadEnvConfig", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("throws when TELEGRAM_BOT_TOKEN is missing", () => {
    setRequiredEnv();
    delete process.env.TELEGRAM_BOT_TOKEN;

    expect(() => loadEnvConfig()).toThrow("TELEGRAM_BOT_TOKEN");
  });

  it("throws when MINIAPP_URL is missing", () => {
    setRequiredEnv();
    delete process.env.MINIAPP_URL;

    expect(() => loadEnvConfig()).toThrow("MINIAPP_URL");
  });

  it("throws when BACKEND_API_BASE_URL is missing", () => {
    setRequiredEnv();
    delete process.env.BACKEND_API_BASE_URL;

    expect(() => loadEnvConfig()).toThrow("BACKEND_API_BASE_URL");
  });

  it("returns all required values, and an empty admin list when ADMIN_TELEGRAM_IDS is unset", () => {
    setRequiredEnv();
    delete process.env.ADMIN_TELEGRAM_IDS;

    expect(loadEnvConfig()).toEqual({
      botToken: "test-token",
      miniAppUrl: "https://example.com/app",
      backendApiBaseUrl: "https://api.example.com",
      adminTelegramIds: [],
    });
  });

  it("parses a comma-separated ADMIN_TELEGRAM_IDS list into numbers", () => {
    setRequiredEnv();
    process.env.ADMIN_TELEGRAM_IDS = "123456789, 987654321,555";

    expect(loadEnvConfig().adminTelegramIds).toEqual([123456789, 987654321, 555]);
  });

  it("ignores blank entries and non-numeric junk in ADMIN_TELEGRAM_IDS", () => {
    setRequiredEnv();
    process.env.ADMIN_TELEGRAM_IDS = "123, ,abc,456";

    expect(loadEnvConfig().adminTelegramIds).toEqual([123, 456]);
  });
});
