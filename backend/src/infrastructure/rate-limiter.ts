export class InMemoryRateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly maxHits: number,
    private readonly windowMs: number,
  ) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const recentHits = (this.hits.get(key) ?? []).filter((timestamp) => now - timestamp < this.windowMs);

    if (recentHits.length >= this.maxHits) {
      this.hits.set(key, recentHits);
      return false;
    }

    recentHits.push(now);
    this.hits.set(key, recentHits);
    return true;
  }
}
