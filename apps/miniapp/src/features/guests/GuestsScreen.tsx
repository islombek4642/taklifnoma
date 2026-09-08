import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UsersRound } from "lucide-react";
import { RSVP_STATUS } from "../../constants/rsvp-status.js";
import { apiClient, type GuestDto } from "../../services/api-client.js";
import { getInitData } from "../../services/telegram.js";
import { formatRespondedAtUz } from "../../utils/format-date.js";
import { TopBar } from "../../components/TopBar.js";
import { Button } from "../../components/Button.js";
import { EmptyState } from "../../components/EmptyState.js";
import { Avatar } from "../../components/Avatar.js";
import { StatusPill } from "../../components/StatusPill.js";
import "./GuestsScreen.css";

type LoadState =
  | { status: "loading" }
  | { status: "no-invitation" }
  | { status: "ready"; guests: GuestDto[] }
  | { status: "error" };

export function GuestsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    apiClient
      .listGuests(getInitData())
      .then((guests) => {
        if (cancelled) return;
        setState(guests === null ? { status: "no-invitation" } : { status: "ready", guests });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") return <p className="guests-status-text">{t("guests.loading")}</p>;
  if (state.status === "error") return <p className="guests-status-text">{t("common.errorGeneric")}</p>;

  if (state.status === "no-invitation") {
    return (
      <EmptyState
        icon={<UsersRound size={48} strokeWidth={1.4} />}
        title={t("guests.noInvitation")}
        subtitle={t("home.emptySubtitle")}
        action={
          <Button fullWidth onClick={() => navigate("/builder")}>
            {t("home.createButton")}
          </Button>
        }
      />
    );
  }

  const { guests } = state;
  const coming = guests.filter((guest) => guest.status === RSVP_STATUS.COMING).length;
  const notComing = guests.filter((guest) => guest.status === RSVP_STATUS.NOT_COMING).length;

  return (
    <div>
      <TopBar title={t("tabs.guests")} />

      {guests.length === 0 ? (
        <p className="guests-status-text">{t("guests.empty")}</p>
      ) : (
        <>
          <div className="guests-stats">
            <div className="guests-stats__pill guests-stats__pill--success">
              <div className="guests-stats__num">{coming}</div>
              <div className="guests-stats__label">{t("guests.comingLabel")}</div>
            </div>
            <div className="guests-stats__pill guests-stats__pill--decline">
              <div className="guests-stats__num">{notComing}</div>
              <div className="guests-stats__label">{t("guests.notComingLabel")}</div>
            </div>
          </div>

          <ul className="guest-list">
            {guests.map((guest) => (
              <li key={guest.id} className="guest-row">
                <Avatar name={guest.guestName} />
                <span className="guest-row__info">
                  <span className="guest-row__name">{guest.guestName}</span>
                  <span className="guest-row__time">{formatRespondedAtUz(guest.respondedAt)}</span>
                </span>
                <StatusPill tone={guest.status === RSVP_STATUS.COMING ? "success" : "decline"}>
                  {t(guest.status === RSVP_STATUS.COMING ? "guests.comingLabel" : "guests.notComingLabel")}
                </StatusPill>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
