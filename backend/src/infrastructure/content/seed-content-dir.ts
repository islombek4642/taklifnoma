import { access, cp, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function exists(target: string): Promise<boolean> {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

// The build copies content-seed/ next to dist/ (see package.json's build
// script), so from the compiled dist/infrastructure/content/ it's two
// levels up. Running the TS source directly (tsx/vitest, no build step)
// it's three levels up instead, since content-seed/ sits next to src/'s
// parent (backend/) rather than next to src/ itself. Try both so seeding
// works the same in dev and in the built/Docker image.
async function resolveSeedDir(): Promise<string> {
  const candidates = [
    path.join(__dirname, "..", "..", "content-seed"),
    path.join(__dirname, "..", "..", "..", "content-seed"),
  ];
  for (const candidate of candidates) {
    if (await exists(candidate)) return candidate;
  }
  return candidates[0]!;
}

async function seedCategory(category: "templates" | "music", contentDir: string, seedDir: string): Promise<void> {
  const seedCategoryDir = path.join(seedDir, category);
  const targetCategoryDir = path.join(contentDir, category);
  await mkdir(targetCategoryDir, { recursive: true });

  const seedEntries = await readdir(seedCategoryDir, { withFileTypes: true }).catch(() => []);
  for (const entry of seedEntries) {
    if (!entry.isDirectory()) continue;
    const targetEntryDir = path.join(targetCategoryDir, entry.name);
    if (await exists(targetEntryDir)) continue;
    await cp(path.join(seedCategoryDir, entry.name), targetEntryDir, { recursive: true });
  }
}

/**
 * On first boot (or whenever a seed item is missing from CONTENT_DIR),
 * copies the bundled sample template/tracks in — so the app has something
 * to offer before an admin upload flow exists to add more. Never touches
 * a folder that's already there, so it's safe to run on every startup and
 * won't resurrect something an admin deliberately removed.
 */
export async function seedContentDir(contentDir: string): Promise<void> {
  const seedDir = await resolveSeedDir();
  await seedCategory("templates", contentDir, seedDir);
  await seedCategory("music", contentDir, seedDir);
}
