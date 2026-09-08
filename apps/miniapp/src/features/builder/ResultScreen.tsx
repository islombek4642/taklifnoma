import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, Share2, Eye } from "lucide-react";
import { PUBLIC_SITE_BASE_URL } from "../../constants/config.js";
import { shareInvitationLink } from "../../services/telegram.js";
import type { InvitationDto } from "../../services/api-client.js";
import { Card } from "../../components/Card.js";
import { Button } from "../../components/Button.js";
import "./ResultScreen.css";

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
    <div className="result-screen page-transition">
      <div className="result-screen__check">
        <Check size={34} strokeWidth={3} />
      </div>
      <h1 className="result-screen__title">{t("result.title")}</h1>

      <Card elevation="lg" className="result-screen__qr-card">
        <QRCodeSVG value={publicUrl} size={168} />
      </Card>

      <div className="result-screen__link-row">
        <span className="result-screen__link-text">{publicUrl}</span>
        <button
          type="button"
          className="result-screen__copy-btn"
          onClick={copyLink}
          aria-label={t(copied ? "result.copied" : "result.copyLink")}
        >
          {copied ? <Check size={15} strokeWidth={2} /> : <Copy size={15} strokeWidth={1.6} />}
        </button>
      </div>

      <div className="result-screen__actions">
        <Button
          icon={<Share2 size={16} strokeWidth={1.6} />}
          onClick={() => shareInvitationLink(publicUrl, `${invitation.groomName} & ${invitation.brideName}`)}
        >
          {t("result.share")}
        </Button>
        <a className="btn btn--outline" href={publicUrl} target="_blank" rel="noreferrer">
          <Eye size={16} strokeWidth={1.6} />
          {t("result.view")}
        </a>
      </div>

      <button type="button" className="btn btn--text" onClick={() => navigate("/")}>
        {t("result.backHome")}
      </button>
    </div>
  );
}
