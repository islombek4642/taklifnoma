import { access, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { seedContentDir } from "../../../src/infrastructure/content/seed-content-dir.js";
import { FilesystemTemplateRegistry } from "../../../src/infrastructure/content/filesystem-template-registry.js";

let contentDir: string;

beforeEach(async () => {
  contentDir = await mkdtemp(path.join(os.tmpdir(), "taklifnoma-seed-"));
});

afterEach(async () => {
  await rm(contentDir, { recursive: true, force: true });
});

async function exists(target: string): Promise<boolean> {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

describe("seedContentDir", () => {
  it("copies the bundled classic template and sample tracks into an empty contentDir", async () => {
    await seedContentDir(contentDir);

    expect(await exists(path.join(contentDir, "templates", "classic", "manifest.json"))).toBe(true);
    expect(await exists(path.join(contentDir, "templates", "classic", "style.css"))).toBe(true);
    expect(await exists(path.join(contentDir, "music", "romantic-piano", "track.wav"))).toBe(true);
    expect(await exists(path.join(contentDir, "music", "gentle-strings", "track.wav"))).toBe(true);
  });

  it("seeds every bundled template with a valid, non-empty manifest and stylesheet", async () => {
    await seedContentDir(contentDir);

    const templates = await new FilesystemTemplateRegistry(contentDir).list();
    const ids = templates.map((template) => template.id).sort();

    expect(ids).toEqual(["classic", "lake-como-letters", "wedding-cinema"]);
    for (const template of templates) {
      expect(template.name.length).toBeGreaterThan(0);
      expect(template.description.length).toBeGreaterThan(0);
      expect(template.accentColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(template.styleCss.length).toBeGreaterThan(0);
    }
  });

  it("never overwrites a folder that already exists at that id", async () => {
    const customDir = path.join(contentDir, "templates", "classic");
    await mkdir(customDir, { recursive: true });
    await writeFile(path.join(customDir, "manifest.json"), JSON.stringify({ name: "Custom", accentColor: "#000" }));

    await seedContentDir(contentDir);

    const manifestRaw = await import("node:fs/promises").then((fs) =>
      fs.readFile(path.join(customDir, "manifest.json"), "utf-8"),
    );
    expect(JSON.parse(manifestRaw)).toEqual({ name: "Custom", accentColor: "#000" });
  });
});
