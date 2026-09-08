import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiClient, type InvitationDto } from "../../services/api-client.js";
import { getInitData, shareInvitationLink } from "../../services/telegram.js";
import { formatEventDateUz } from "../../utils/format-date.js";
import { PUBLIC_SITE_BASE_URL } from "../../constants/config.js";

type LoadState =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "ready"; invitation: InvitationDto }
  | { status: "error" };

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

  if (state.status === "loading") return <p>{t("home.loading")}</p>;
  if (state.status === "error") return <p>{t("common.errorGeneric")}</p>;

  if (state.status === "empty") {
    return (
      <div>
        <h1>{t("home.emptyTitle")}</h1>
        <p>{t("home.emptySubtitle")}</p>
        <button onClick={() => navigate("/builder")}>{t("home.createButton")}</button>
      </div>
    );
  }

  const { invitation } = state;
  const publicUrl = `${PUBLIC_SITE_BASE_URL}/${invitation.slug}`;

  return (
    <div>
      <h1>
        {invitation.groomName} &amp; {invitation.brideName}
      </h1>
      <p>{formatEventDateUz(invitation.eventDateTime)}</p>
      <button onClick={() => navigate("/builder")}>{t("home.editButton")}</button>
      <a href={publicUrl} target="_blank" rel="noreferrer">
        {t("home.viewButton")}
      </a>
      <button onClick={() => shareInvitationLink(publicUrl, `${invitation.groomName} & ${invitation.brideName}`)}>
        {t("home.shareButton")}
      </button>
    </div>
  );
}
