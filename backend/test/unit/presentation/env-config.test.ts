import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadEnvConfig } from "../../../src/presentation/env-config.js";

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
    process.env.MINIAPP_ORIGIN = "https://app.example.com";
    expect(() => loadEnvConfig()).toThrow("TELEGRAM_BOT_TOKEN");
  });

  it("throws when MINIAPP_ORIGIN is missing", () => {
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    delete process.env.MINIAPP_ORIGIN;
    expect(() => loadEnvConfig()).toThrow("MINIAPP_ORIGIN");
  });

  it("defaults PORT to 3000 when not set", () => {
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    process.env.MINIAPP_ORIGIN = "https://app.example.com";
    delete process.env.PORT;

    expect(loadEnvConfig().port).toBe(3000);
  });

  it("parses a custom PORT", () => {
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    process.env.MINIAPP_ORIGIN = "https://app.example.com";
    process.env.PORT = "4000";

    expect(loadEnvConfig().port).toBe(4000);
  });
});
