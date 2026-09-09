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

  describe("create", () => {
    it("writes a manifest and the audio file, and returns a track visible to list()", async () => {
      const registry = new FilesystemMusicRegistry(contentDir);

      const track = await registry.create({ title: "Yangi kuy", fileBuffer: Buffer.from("fake-audio-bytes"), fileExtension: "mp3" });

      expect(track.title).toBe("Yangi kuy");
      expect(track.fileUrl).toBe(`/media/music/${track.id}/track.mp3`);
      expect(await registry.list()).toContainEqual(track);
    });

    it("generates a unique id for two tracks with the same title", async () => {
      const registry = new FilesystemMusicRegistry(contentDir);

      const first = await registry.create({ title: "Kuy", fileBuffer: Buffer.from("a"), fileExtension: "mp3" });
      const second = await registry.create({ title: "Kuy", fileBuffer: Buffer.from("b"), fileExtension: "mp3" });

      expect(first.id).not.toBe(second.id);
      expect(await registry.list()).toHaveLength(2);
    });

    it("persists the actual audio bytes to disk", async () => {
      const registry = new FilesystemMusicRegistry(contentDir);
      const bytes = Buffer.from("fake-audio-bytes");

      const track = await registry.create({ title: "Kuy", fileBuffer: bytes, fileExtension: "wav" });

      const written = await import("node:fs/promises").then((fs) =>
        fs.readFile(path.join(contentDir, "music", track.id, "track.wav")),
      );
      expect(written.equals(bytes)).toBe(true);
    });
  });
});
