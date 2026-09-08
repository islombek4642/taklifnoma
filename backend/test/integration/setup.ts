import { execSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = path.join(__dirname, "..", "..");
export const TEST_DB_PATH = path.join(BACKEND_ROOT, "prisma", "test.db");

process.env.DATABASE_URL = `file:${TEST_DB_PATH}`;

export function resetTestDatabase(): void {
  if (existsSync(TEST_DB_PATH)) unlinkSync(TEST_DB_PATH);
  execSync("npx prisma migrate deploy", {
    cwd: BACKEND_ROOT,
    env: process.env,
    stdio: "ignore",
  });
}

export async function clearTestDatabaseTables(): Promise<void> {
  const { prisma } = await import("../../src/infrastructure/db/prisma-client.js");
  await prisma.rsvpResponse.deleteMany();
  await prisma.invitation.deleteMany();
}
