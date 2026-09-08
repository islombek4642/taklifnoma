import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RSVP_STATUS } from "../../constants/rsvp-status.js";
import { apiClient, type GuestDto } from "../../services/api-client.js";
import { getInitData } from "../../services/telegram.js";

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

  if (state.status === "loading") return <p>{t("guests.loading")}</p>;
  if (state.status === "error") return <p>{t("common.errorGeneric")}</p>;

  if (state.status === "no-invitation") {
    return (
      <div>
        <p>{t("guests.noInvitation")}</p>
        <button onClick={() => navigate("/builder")}>{t("home.createButton")}</button>
      </div>
    );
  }

  const { guests } = state;
  if (guests.length === 0) return <p>{t("guests.empty")}</p>;

  const coming = guests.filter((guest) => guest.status === RSVP_STATUS.COMING).length;
  const notComing = guests.filter((guest) => guest.status === RSVP_STATUS.NOT_COMING).length;

  return (
    <div>
      <p>{t("guests.summary", { coming, notComing })}</p>
      <ul>
        {guests.map((guest) => (
          <li key={guest.id}>
            {guest.guestName} — {t(guest.status === RSVP_STATUS.COMING ? "guests.comingLabel" : "guests.notComingLabel")}
          </li>
        ))}
      </ul>
    </div>
  );
}
