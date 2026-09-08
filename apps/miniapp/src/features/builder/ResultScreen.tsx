import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import { PUBLIC_SITE_BASE_URL } from "../../constants/config.js";
import { shareInvitationLink } from "../../services/telegram.js";
import type { InvitationDto } from "../../services/api-client.js";

export function ResultScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const invitation = location.state as InvitationDto | undefined;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!invitation) navigate("/", { replace: true });
  }, [invitation, navigate]);

  if (!invitation) return null;

  const publicUrl = `${PUBLIC_SITE_BASE_URL}/${invitation.slug}`;

  async function copyLink(): Promise<void> {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
  }

  return (
    <div>
      <h1>{t("result.title")}</h1>
      <QRCodeSVG value={publicUrl} size={200} />
      <p>{publicUrl}</p>
      <button onClick={copyLink}>{t(copied ? "result.copied" : "result.copyLink")}</button>
      <button onClick={() => shareInvitationLink(publicUrl, `${invitation.groomName} & ${invitation.brideName}`)}>
        {t("result.share")}
      </button>
      <a href={publicUrl} target="_blank" rel="noreferrer">
        {t("result.view")}
      </a>
      <button onClick={() => navigate("/")}>{t("result.backHome")}</button>
    </div>
  );
}
