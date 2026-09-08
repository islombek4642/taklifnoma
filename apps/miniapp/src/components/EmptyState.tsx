import type { ReactNode } from "react";
import "./EmptyState.css";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__badge">{icon}</div>
      <h1 className="empty-state__title">{title}</h1>
      <p className="empty-state__subtitle">{subtitle}</p>
      {action ? <div className="empty-state__action">{action}</div> : null}
    </div>
  );
}
