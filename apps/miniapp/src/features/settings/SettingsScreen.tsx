import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiClient } from "../../services/api-client.js";
import { getInitData } from "../../services/telegram.js";

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
      <h2>{t("settings.help")}</h2>
      <p>{t("settings.helpText")}</p>

      {!confirming ? (
        <button onClick={() => setConfirming(true)}>{t("settings.deleteButton")}</button>
      ) : (
        <div>
          <p>{t("settings.deleteConfirm")}</p>
          <button onClick={handleDelete} disabled={deleting}>
            {t("settings.deleteConfirmYes")}
          </button>
          <button onClick={() => setConfirming(false)}>{t("settings.deleteConfirmNo")}</button>
        </div>
      )}
    </div>
  );
}
