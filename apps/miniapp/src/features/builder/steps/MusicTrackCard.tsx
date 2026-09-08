import { useRef, useState } from "react";
import { Play, Pause, Check } from "lucide-react";
import type { MusicTrack } from "../../../constants/music-tracks.js";
import "./MusicTrackCard.css";

interface MusicTrackCardProps {
  track: MusicTrack;
  title: string;
  selected: boolean;
  onSelect: () => void;
}

const WAVEFORM_BAR_HEIGHTS = [6, 11, 15, 8, 13, 6, 10, 15, 9, 7, 12, 6];

export function MusicTrackCard({ track, title, selected, onSelect }: MusicTrackCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  function togglePlayback(event: React.MouseEvent): void {
    event.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      void audio.play();
    }
  }

  return (
    <div
      className={selected ? "music-track music-track--selected" : "music-track"}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
    >
      <button
        type="button"
        className="music-track__play"
        onClick={togglePlayback}
        aria-label={title}
      >
        {playing ? <Pause size={16} strokeWidth={1.8} /> : <Play size={16} strokeWidth={1.8} />}
      </button>

      <div className="music-track__info">
        <div className="music-track__title">{title}</div>
        <div className="music-track__waveform">
          {WAVEFORM_BAR_HEIGHTS.map((height, index) => (
            <span key={index} style={{ height: `${height}px` }} />
          ))}
        </div>
      </div>

      <div className="music-track__check">{selected ? <Check size={13} strokeWidth={2.4} /> : null}</div>

      <audio
        ref={audioRef}
        src={track.fileUrl}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        hidden
      />
    </div>
  );
}
