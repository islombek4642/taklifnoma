import { useTranslation } from "react-i18next";
import { MUSIC_TRACKS } from "../../../constants/music-tracks.js";
import { MusicTrackCard } from "./MusicTrackCard.js";
import type { BuilderFormState } from "../builder-form.js";
import "./MusicStep.css";

interface Props {
  form: BuilderFormState;
  onChange: <K extends keyof BuilderFormState>(key: K, value: BuilderFormState[K]) => void;
}

export function MusicStep({ form, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      <p className="music-step__hint">{t("builder.fields.musicTrack")}</p>
      <div role="radiogroup" aria-label={t("builder.fields.musicTrack")}>
        {MUSIC_TRACKS.map((track) => (
          <MusicTrackCard
            key={track.id}
            track={track}
            title={t(track.titleKey)}
            selected={form.musicTrackId === track.id}
            onSelect={() => onChange("musicTrackId", track.id)}
          />
        ))}
      </div>
    </div>
  );
}
