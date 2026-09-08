import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
