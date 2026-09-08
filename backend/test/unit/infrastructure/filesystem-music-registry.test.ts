import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FilesystemMusicRegistry } from "../../../src/infrastructure/content/filesystem-music-registry.js";

let contentDir: string;

beforeEach(async () => {
  contentDir = await mkdtemp(path.join(os.tmpdir(), "taklifnoma-music-"));
});

afterEach(async () => {
  await rm(contentDir, { recursive: true, force: true });
});

async function writeTrack(id: string, manifest: Record<string, unknown>) {
  const dir = path.join(contentDir, "music", id);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "manifest.json"), JSON.stringify(manifest));
}

describe("FilesystemMusicRegistry", () => {
  it("returns an empty list when the music directory doesn't exist yet", async () => {
    const registry = new FilesystemMusicRegistry(contentDir);

    expect(await registry.list()).toEqual([]);
  });

  it("lists tracks with a fileUrl pointing at the /media/music static route", async () => {
    await writeTrack("romantic-piano", { title: "Romantik pianino", file: "track.wav" });
    const registry = new FilesystemMusicRegistry(contentDir);

    const tracks = await registry.list();

    expect(tracks).toEqual([
      { id: "romantic-piano", title: "Romantik pianino", fileUrl: "/media/music/romantic-piano/track.wav" },
    ]);
  });

  it("exists() reports whether a track id is present", async () => {
    await writeTrack("romantic-piano", { title: "Romantik pianino", file: "track.wav" });
    const registry = new FilesystemMusicRegistry(contentDir);

    expect(await registry.exists("romantic-piano")).toBe(true);
    expect(await registry.exists("unknown")).toBe(false);
  });
});
