import { useTranslation } from "react-i18next";
import { MUSIC_TRACKS } from "../../../constants/music-tracks.js";
import type { BuilderFormState } from "../builder-form.js";

interface Props {
  form: BuilderFormState;
  onChange: <K extends keyof BuilderFormState>(key: K, value: BuilderFormState[K]) => void;
}

export function MusicStep({ form, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      <p>{t("builder.fields.musicTrack")}</p>
      {MUSIC_TRACKS.map((track) => (
        <div key={track.id}>
          <label>
            <input
              type="radio"
              name="musicTrack"
              checked={form.musicTrackId === track.id}
              onChange={() => onChange("musicTrackId", track.id)}
            />
            {t(track.titleKey)}
          </label>
          <audio controls src={track.fileUrl} />
        </div>
      ))}
    </div>
  );
}
