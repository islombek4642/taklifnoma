import type { MusicRegistry, MusicTrackDto } from "../../src/application/ports/content-registry.js";

const DEFAULT_TRACKS: MusicTrackDto[] = [
  { id: "romantic-piano", title: "Romantik pianino", fileUrl: "/media/music/romantic-piano/track.wav" },
  { id: "gentle-strings", title: "Yumshoq torli asboblar", fileUrl: "/media/music/gentle-strings/track.wav" },
];

export class InMemoryMusicRegistry implements MusicRegistry {
  constructor(private readonly tracks: MusicTrackDto[] = DEFAULT_TRACKS) {}

  async list(): Promise<MusicTrackDto[]> {
    return this.tracks;
  }

  async exists(id: string): Promise<boolean> {
    return this.tracks.some((track) => track.id === id);
  }
}
