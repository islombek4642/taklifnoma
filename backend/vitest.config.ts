import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    // Integration tests share a single SQLite file (test/integration/setup.ts);
    // running test files in parallel races their beforeAll/beforeEach hooks
    // against each other, corrupting shared rows between files.
    fileParallelism: false,
  },
});
