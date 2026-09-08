import { Check } from "lucide-react";
import type { TemplateDto } from "../../../services/api-client.js";
import "./TemplateCard.css";

interface TemplateCardProps {
  template: TemplateDto;
  selected: boolean;
  onSelect: () => void;
}

export function TemplateCard({ template, selected, onSelect }: TemplateCardProps) {
  return (
    <div
      className={selected ? "template-card template-card--selected" : "template-card"}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
    >
      <div className="template-card__swatch" style={{ background: template.accentColor }} />
      <div className="template-card__name">{template.name}</div>
      <div className="template-card__check">{selected ? <Check size={13} strokeWidth={2.4} /> : null}</div>
    </div>
  );
}
