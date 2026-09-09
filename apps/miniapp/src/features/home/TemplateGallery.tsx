import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiClient, type TemplateDto } from "../../services/api-client.js";
import { PUBLIC_SITE_BASE_URL } from "../../constants/config.js";
import { TemplateGalleryCard } from "./TemplateGalleryCard.js";
import "./TemplateGallery.css";

interface TemplateGalleryProps {
  onSelect: (templateId: string) => void;
}

type LoadState = { status: "loading" } | { status: "ready"; templates: TemplateDto[] } | { status: "error" };

export function TemplateGallery({ onSelect }: TemplateGalleryProps) {
  const { t } = useTranslation();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    apiClient
      .getTemplates()
      .then((templates) => {
        if (!cancelled) setState({ status: "ready", templates });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") return <p className="template-gallery__hint">{t("home.loading")}</p>;
  if (state.status === "error") return <p className="template-gallery__hint">{t("common.errorGeneric")}</p>;

  return (
    <div className="template-gallery">
      {state.templates.map((template) => (
        <TemplateGalleryCard
          key={template.id}
          template={template}
          previewUrl={`${PUBLIC_SITE_BASE_URL}/preview/${template.id}`}
          onSelect={() => onSelect(template.id)}
        />
      ))}
    </div>
  );
}
