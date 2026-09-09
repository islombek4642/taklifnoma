import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FilesystemTemplateRegistry } from "../../../src/infrastructure/content/filesystem-template-registry.js";

let contentDir: string;

beforeEach(async () => {
  contentDir = await mkdtemp(path.join(os.tmpdir(), "taklifnoma-templates-"));
});

afterEach(async () => {
  await rm(contentDir, { recursive: true, force: true });
});

async function writeTemplate(id: string, manifest: Record<string, unknown>, styleCss = "body { color: red; }") {
  const dir = path.join(contentDir, "templates", id);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "manifest.json"), JSON.stringify(manifest));
  await writeFile(path.join(dir, "style.css"), styleCss);
}

describe("FilesystemTemplateRegistry", () => {
  it("returns an empty list when the templates directory doesn't exist yet", async () => {
    const registry = new FilesystemTemplateRegistry(contentDir);

    expect(await registry.list()).toEqual([]);
  });

  it("lists templates that have both a manifest and a stylesheet", async () => {
    await writeTemplate(
      "classic",
      { name: "Klassik", description: "Iliq uslub", accentColor: "#b45d52" },
      "body { color: blue; }",
    );
    const registry = new FilesystemTemplateRegistry(contentDir);

    const templates = await registry.list();

    expect(templates).toEqual([
      { id: "classic", name: "Klassik", description: "Iliq uslub", accentColor: "#b45d52", styleCss: "body { color: blue; }" },
    ]);
  });

  it("defaults description to an empty string for a manifest written before that field existed", async () => {
    // seedContentDir never overwrites a folder that's already there, so a
    // CONTENT_DIR seeded before the `description` field was introduced can
    // legitimately have a manifest.json without it — this must never crash
    // a page that lists templates (e.g. the landing page).
    await writeTemplate("classic", { name: "Klassik", accentColor: "#b45d52" });
    const registry = new FilesystemTemplateRegistry(contentDir);

    const templates = await registry.list();

    expect(templates).toEqual([
      { id: "classic", name: "Klassik", description: "", accentColor: "#b45d52", styleCss: "body { color: red; }" },
    ]);
  });

  it("skips a folder that has no manifest.json", async () => {
    await mkdir(path.join(contentDir, "templates", "broken"), { recursive: true });
    const registry = new FilesystemTemplateRegistry(contentDir);

    expect(await registry.list()).toEqual([]);
  });

  it("exists() reports whether a template id is present", async () => {
    await writeTemplate("classic", { name: "Klassik", description: "Iliq uslub", accentColor: "#b45d52" });
    const registry = new FilesystemTemplateRegistry(contentDir);

    expect(await registry.exists("classic")).toBe(true);
    expect(await registry.exists("unknown")).toBe(false);
  });
});
