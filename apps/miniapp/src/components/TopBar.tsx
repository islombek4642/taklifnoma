import { ChevronLeft } from "lucide-react";
import { IconButton } from "./IconButton.js";
import "./TopBar.css";

interface TopBarProps {
  title: string;
  eyebrow?: string;
  onBack?: () => void;
  backLabel?: string;
}

export function TopBar({ title, eyebrow, onBack, backLabel }: TopBarProps) {
  return (
    <div className="top-bar">
      {onBack ? (
        <IconButton icon={<ChevronLeft size={18} strokeWidth={2} />} aria-label={backLabel ?? title} onClick={onBack} />
      ) : null}
      <div className="top-bar__text">
        {eyebrow ? <span className="top-bar__eyebrow">{eyebrow}</span> : null}
        <h2 className="top-bar__title">{title}</h2>
      </div>
    </div>
  );
}
