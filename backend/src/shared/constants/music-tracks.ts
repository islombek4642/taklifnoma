export interface MusicTrack {
  id: string;
  titleKey: string;
  fileUrl: string;
  licenseUrl: string;
  source: string;
}

// Royalty-free tracks only. Add licenseUrl/source for every entry — see
// docs/superpowers/specs/2026-09-07-taklifnoma-mvp-design.md section 3a.
export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: "romantic-piano",
    titleKey: "music.romanticPiano",
    fileUrl: "/assets/music/romantic-piano.mp3",
    licenseUrl: "https://pixabay.com/service/license-summary/",
    source: "Pixabay Music",
  },
  {
    id: "gentle-strings",
    titleKey: "music.gentleStrings",
    fileUrl: "/assets/music/gentle-strings.mp3",
    licenseUrl: "https://pixabay.com/service/license-summary/",
    source: "Pixabay Music",
  },
];

export function findMusicTrackById(id: string): MusicTrack | undefined {
  return MUSIC_TRACKS.find((track) => track.id === id);
}
