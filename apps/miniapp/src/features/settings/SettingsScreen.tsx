import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HelpCircle, Trash2 } from "lucide-react";
import { apiClient } from "../../services/api-client.js";
import { getInitData } from "../../services/telegram.js";
import { TopBar } from "../../components/TopBar.js";
import { Card } from "../../components/Card.js";
import { Button } from "../../components/Button.js";
import "./SettingsScreen.css";

export function SettingsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(): Promise<void> {
    setDeleting(true);
    try {
      await apiClient.deleteInvitation(getInitData());
      navigate("/", { replace: true });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <TopBar title={t("tabs.settings")} />

      <div className="settings-group">
        <div className="settings-group__title">{t("settings.help")}</div>
        <Card className="settings-menu">
          <div className="settings-menu__row">
            <div className="settings-menu__icon">
              <HelpCircle size={18} strokeWidth={1.4} />
            </div>
            <p className="settings-menu__text">{t("settings.helpText")}</p>
          </div>
        </Card>
      </div>

      {!confirming ? (
        <div className="settings-group">
          <div className="settings-group__title">{t("settings.dangerZone")}</div>
          <Card className="settings-menu">
            <button type="button" className="settings-menu__row settings-menu__row--action" onClick={() => setConfirming(true)}>
              <div className="settings-menu__icon settings-menu__icon--danger">
                <Trash2 size={18} strokeWidth={1.4} />
              </div>
              <span className="settings-menu__label settings-menu__label--danger">{t("settings.deleteButton")}</span>
            </button>
          </Card>
        </div>
      ) : (
        <Card elevation="lg" className="settings-confirm">
          <p className="settings-confirm__text">{t("settings.deleteConfirm")}</p>
          <div className="settings-confirm__actions">
            <Button variant="soft" onClick={() => setConfirming(false)}>
              {t("settings.deleteConfirmNo")}
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {t("settings.deleteConfirmYes")}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
