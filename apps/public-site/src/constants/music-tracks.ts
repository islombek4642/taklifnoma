export interface MusicTrack {
  id: string;
  fileUrl: string;
}

export const MUSIC_TRACKS: MusicTrack[] = [
  { id: "romantic-piano", fileUrl: "/assets/music/romantic-piano.mp3" },
  { id: "gentle-strings", fileUrl: "/assets/music/gentle-strings.mp3" },
];

export function findMusicTrackById(id: string): MusicTrack | undefined {
  return MUSIC_TRACKS.find((track) => track.id === id);
}
