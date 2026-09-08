import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, MapPin, Music2, Pencil, Eye, Share2 } from "lucide-react";
import { apiClient, type InvitationDto } from "../../services/api-client.js";
import { getInitData, shareInvitationLink } from "../../services/telegram.js";
import { formatEventDateUz } from "../../utils/format-date.js";
import { PUBLIC_SITE_BASE_URL } from "../../constants/config.js";
import { MUSIC_TRACKS } from "../../constants/music-tracks.js";
import { Button } from "../../components/Button.js";
import { Card } from "../../components/Card.js";
import { EmptyState } from "../../components/EmptyState.js";
import "./HomeScreen.css";

type LoadState =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "ready"; invitation: InvitationDto }
  | { status: "error" };

function musicTrackTitle(musicTrackId: string, fallback: (key: string) => string): string | undefined {
  const track = MUSIC_TRACKS.find((candidate) => candidate.id === musicTrackId);
  return track ? fallback(track.titleKey) : undefined;
}

export function HomeScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    apiClient
      .getMyInvitation(getInitData())
      .then((invitation) => {
        if (cancelled) return;
        setState(invitation ? { status: "ready", invitation } : { status: "empty" });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") return <p className="home-status-text">{t("home.loading")}</p>;
  if (state.status === "error") return <p className="home-status-text">{t("common.errorGeneric")}</p>;

  if (state.status === "empty") {
    return (
      <EmptyState
        icon={<Heart size={56} strokeWidth={1.4} />}
        title={t("home.emptyTitle")}
        subtitle={t("home.emptySubtitle")}
        action={
          <Button fullWidth onClick={() => navigate("/builder")}>
            {t("home.createButton")}
          </Button>
        }
      />
    );
  }

  const { invitation } = state;
  const publicUrl = `${PUBLIC_SITE_BASE_URL}/${invitation.slug}`;
  const trackTitle = musicTrackTitle(invitation.musicTrackId, t);

  return (
    <div className="home-filled">
      <Card elevation="lg" className="invite-card">
        <div className="invite-card__names">
          {invitation.groomName} <span className="invite-card__amp">&amp;</span> {invitation.brideName}
        </div>
        <div className="invite-card__date">{formatEventDateUz(invitation.eventDateTime)}</div>
        <div className="invite-card__divider" />
        <div className="invite-card__row">
          <MapPin size={15} strokeWidth={1.5} />
          <span>
            <b>{invitation.venueName}</b>, {invitation.venueAddress}
          </span>
        </div>
        {trackTitle ? (
          <div className="invite-card__row">
            <Music2 size={15} strokeWidth={1.5} />
            <span>{trackTitle}</span>
          </div>
        ) : null}
      </Card>

      <div className="home-filled__actions">
        <Button variant="outline" icon={<Pencil size={16} strokeWidth={1.6} />} onClick={() => navigate("/builder")}>
          {t("home.editButton")}
        </Button>
        <a className="btn btn--primary" href={publicUrl} target="_blank" rel="noreferrer">
          <Eye size={16} strokeWidth={1.6} />
          {t("home.viewButton")}
        </a>
      </div>
      <Button
        variant="soft"
        fullWidth
        icon={<Share2 size={16} strokeWidth={1.6} />}
        onClick={() => shareInvitationLink(publicUrl, `${invitation.groomName} & ${invitation.brideName}`)}
      >
        {t("home.shareButton")}
      </Button>
    </div>
  );
}
