import { Eye, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TemplateDto } from "../../services/api-client.js";
import { Card } from "../../components/Card.js";
import { Button } from "../../components/Button.js";
import "./TemplateGalleryCard.css";

interface TemplateGalleryCardProps {
  template: TemplateDto;
  previewUrl: string;
  onSelect: () => void;
}

export function TemplateGalleryCard({ template, previewUrl, onSelect }: TemplateGalleryCardProps) {
  const { t } = useTranslation();

  return (
    <Card elevation="sm" className="template-gallery-card">
      <div className="template-gallery-card__preview" style={{ background: template.accentColor }}>
        <span className="template-gallery-card__preview-names">A &amp; B</span>
      </div>
      <div className="template-gallery-card__body">
        <div className="template-gallery-card__name">{template.name}</div>
        <p className="template-gallery-card__description">{template.description}</p>
        <div className="template-gallery-card__actions">
          <a className="btn btn--outline" href={previewUrl} target="_blank" rel="noreferrer">
            <Eye size={15} strokeWidth={1.6} />
            {t("home.templateViewButton")}
          </a>
          <Button icon={<Check size={15} strokeWidth={1.8} />} onClick={onSelect}>
            {t("home.templateSelectButton")}
          </Button>
        </div>
      </div>
    </Card>
  );
}
