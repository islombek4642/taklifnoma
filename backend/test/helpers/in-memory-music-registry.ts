import type { CreateMusicTrackInput, MusicRegistry, MusicTrackDto } from "../../src/application/ports/content-registry.js";

const DEFAULT_TRACKS: MusicTrackDto[] = [
  { id: "romantic-piano", title: "Romantik pianino", fileUrl: "/media/music/romantic-piano/track.wav" },
  { id: "gentle-strings", title: "Yumshoq torli asboblar", fileUrl: "/media/music/gentle-strings/track.wav" },
];

export class InMemoryMusicRegistry implements MusicRegistry {
  private nextId = 0;

  constructor(private readonly tracks: MusicTrackDto[] = [...DEFAULT_TRACKS]) {}

  async list(): Promise<MusicTrackDto[]> {
    return this.tracks;
  }

  async exists(id: string): Promise<boolean> {
    return this.tracks.some((track) => track.id === id);
  }

  async create(input: CreateMusicTrackInput): Promise<MusicTrackDto> {
    const id = `uploaded-${this.nextId++}`;
    const track: MusicTrackDto = { id, title: input.title, fileUrl: `/media/music/${id}/track.${input.fileExtension}` };
    this.tracks.push(track);
    return track;
  }
}
