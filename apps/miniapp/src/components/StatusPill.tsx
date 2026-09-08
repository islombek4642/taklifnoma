import type { ReactNode } from "react";
import "./StatusPill.css";

interface StatusPillProps {
  tone: "success" | "decline";
  children: ReactNode;
}

export function StatusPill({ tone, children }: StatusPillProps) {
  return <span className={`status-pill status-pill--${tone}`}>{children}</span>;
}
