import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { VolumeX, Check } from "lucide-react";
import { apiClient, type MusicTrackDto } from "../../../services/api-client.js";
import { API_BASE_URL } from "../../../constants/config.js";
import { MusicTrackCard } from "./MusicTrackCard.js";
import type { BuilderFormState } from "../builder-form.js";
import "./MusicStep.css";

interface Props {
  form: BuilderFormState;
  onChange: <K extends keyof BuilderFormState>(key: K, value: BuilderFormState[K]) => void;
}

type LoadState = { status: "loading" } | { status: "ready"; tracks: MusicTrackDto[] } | { status: "error" };

export function MusicStep({ form, onChange }: Props) {
  const { t } = useTranslation();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    apiClient
      .getMusicTracks()
      .then((tracks) => {
        if (!cancelled) setState({ status: "ready", tracks });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") return <p className="music-step__hint">{t("home.loading")}</p>;
  if (state.status === "error") return <p className="music-step__hint">{t("common.errorGeneric")}</p>;

  return (
    <div>
      <p className="music-step__hint">{t("builder.fields.musicTrack")}</p>
      <div role="radiogroup" aria-label={t("builder.fields.musicTrack")}>
        <div
          className={form.musicTrackId === "" ? "music-track music-track--selected" : "music-track"}
          role="radio"
          aria-checked={form.musicTrackId === ""}
          tabIndex={0}
          onClick={() => onChange("musicTrackId", "")}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onChange("musicTrackId", "")}
        >
          <div className="music-track__play music-track__play--skip">
            <VolumeX size={16} strokeWidth={1.8} />
          </div>
          <div className="music-track__info">
            <div className="music-track__title">{t("builder.fields.musicSkip")}</div>
          </div>
          <div className="music-track__check">
            {form.musicTrackId === "" ? <Check size={13} strokeWidth={2.4} /> : null}
          </div>
        </div>
        {state.tracks.map((track) => (
          <MusicTrackCard
            key={track.id}
            title={track.title}
            audioUrl={`${API_BASE_URL}${track.fileUrl}`}
            selected={form.musicTrackId === track.id}
            onSelect={() => onChange("musicTrackId", track.id)}
          />
        ))}
      </div>
    </div>
  );
}
