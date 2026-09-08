import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadEnvConfig } from "../../../src/config/env-config.js";

const ORIGINAL_ENV = { ...process.env };

describe("loadEnvConfig", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("throws when TELEGRAM_BOT_TOKEN is missing", () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    process.env.MINIAPP_URL = "https://example.com/app";

    expect(() => loadEnvConfig()).toThrow("TELEGRAM_BOT_TOKEN");
  });

  it("throws when MINIAPP_URL is missing", () => {
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    delete process.env.MINIAPP_URL;

    expect(() => loadEnvConfig()).toThrow("MINIAPP_URL");
  });

  it("returns both values when set", () => {
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    process.env.MINIAPP_URL = "https://example.com/app";

    expect(loadEnvConfig()).toEqual({ botToken: "test-token", miniAppUrl: "https://example.com/app" });
  });
});
