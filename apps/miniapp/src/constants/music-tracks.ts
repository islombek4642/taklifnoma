export interface MusicTrack {
  id: string;
  titleKey: string;
  fileUrl: string;
}

export const MUSIC_TRACKS: MusicTrack[] = [
  { id: "romantic-piano", titleKey: "music.romanticPiano", fileUrl: "/assets/music/romantic-piano.wav" },
  { id: "gentle-strings", titleKey: "music.gentleStrings", fileUrl: "/assets/music/gentle-strings.wav" },
];
