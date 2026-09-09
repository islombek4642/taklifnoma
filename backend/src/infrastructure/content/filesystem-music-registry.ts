import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CreateMusicTrackInput, MusicRegistry, MusicTrackDto } from "../../application/ports/content-registry.js";

interface MusicManifest {
  title: string;
  file: string;
}

// Best-effort readability for the id ("romantic-piano-a1b2c3d4" beats a
// bare UUID) — a title with no Latin/ASCII letters (Uzbek Cyrillic, say)
// just falls back to "track", which is fine since the random suffix below
// is what actually guarantees uniqueness.
function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "track";
}

/**
 * Reads tracks from CONTENT_DIR/music/<id>/{manifest.json,<file>}. The
 * audio file itself is served by the /media/music static route (see
 * app.ts) — fileUrl here is that route's path, relative so callers (Mini
 * App, public-site) prefix it with whichever backend base URL they know.
 */
export class FilesystemMusicRegistry implements MusicRegistry {
  constructor(private readonly contentDir: string) {}

  async list(): Promise<MusicTrackDto[]> {
    const ids = await this.listTrackIds();
    const tracks = await Promise.all(ids.map((id) => this.read(id)));
    return tracks.filter((track): track is MusicTrackDto => track !== null);
  }

  async exists(id: string): Promise<boolean> {
    return (await this.read(id)) !== null;
  }

  async create(input: CreateMusicTrackInput): Promise<MusicTrackDto> {
    const id = `${slugify(input.title)}-${randomUUID().slice(0, 8)}`;
    const dir = path.join(this.musicDir, id);
    const fileName = `track.${input.fileExtension}`;

    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, fileName), input.fileBuffer);
    const manifest: MusicManifest = { title: input.title, file: fileName };
    await writeFile(path.join(dir, "manifest.json"), JSON.stringify(manifest, null, 2));

    return { id, title: input.title, fileUrl: `/media/music/${id}/${fileName}` };
  }

  private get musicDir(): string {
    return path.join(this.contentDir, "music");
  }

  private async listTrackIds(): Promise<string[]> {
    const entries = await readdir(this.musicDir, { withFileTypes: true }).catch(() => []);
    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  }

  private async read(id: string): Promise<MusicTrackDto | null> {
    try {
      const manifestRaw = await readFile(path.join(this.musicDir, id, "manifest.json"), "utf-8");
      const manifest = JSON.parse(manifestRaw) as MusicManifest;
      return { id, title: manifest.title, fileUrl: `/media/music/${id}/${manifest.file}` };
    } catch {
      return null;
    }
  }
}
