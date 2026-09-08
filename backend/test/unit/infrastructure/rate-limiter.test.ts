import { describe, expect, it, vi } from "vitest";
import { InMemoryRateLimiter } from "../../../src/infrastructure/rate-limiter.js";

describe("InMemoryRateLimiter", () => {
  it("allows requests up to the limit and blocks the next one", () => {
    const limiter = new InMemoryRateLimiter(2, 60_000);

    expect(limiter.isAllowed("1.2.3.4")).toBe(true);
    expect(limiter.isAllowed("1.2.3.4")).toBe(true);
    expect(limiter.isAllowed("1.2.3.4")).toBe(false);
  });

  it("tracks each key independently", () => {
    const limiter = new InMemoryRateLimiter(1, 60_000);

    expect(limiter.isAllowed("a")).toBe(true);
    expect(limiter.isAllowed("b")).toBe(true);
  });

  it("allows requests again after the window passes", () => {
    vi.useFakeTimers();
    const limiter = new InMemoryRateLimiter(1, 1_000);

    expect(limiter.isAllowed("1.2.3.4")).toBe(true);
    expect(limiter.isAllowed("1.2.3.4")).toBe(false);

    vi.advanceTimersByTime(1_001);
    expect(limiter.isAllowed("1.2.3.4")).toBe(true);
    vi.useRealTimers();
  });
});
