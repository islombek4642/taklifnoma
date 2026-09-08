import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { MusicRegistry, MusicTrackDto } from "../../application/ports/content-registry.js";

interface MusicManifest {
  title: string;
  file: string;
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
