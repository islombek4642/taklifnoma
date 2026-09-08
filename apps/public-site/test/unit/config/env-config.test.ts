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

  it("throws when BACKEND_API_BASE_URL is missing", () => {
    delete process.env.BACKEND_API_BASE_URL;
    expect(() => loadEnvConfig()).toThrow("BACKEND_API_BASE_URL");
  });

  it("defaults PORT to 4000 when not set", () => {
    process.env.BACKEND_API_BASE_URL = "http://localhost:3000";
    delete process.env.PORT;

    expect(loadEnvConfig().port).toBe(4000);
  });

  it("parses a custom PORT", () => {
    process.env.BACKEND_API_BASE_URL = "http://localhost:3000";
    process.env.PORT = "5000";

    expect(loadEnvConfig().port).toBe(5000);
  });
});
