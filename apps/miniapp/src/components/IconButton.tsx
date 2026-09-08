import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./IconButton.css";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: "surface" | "soft" | "plain";
  "aria-label": string;
}

export function IconButton({ icon, variant = "surface", className, ...rest }: IconButtonProps) {
  const classes = ["icon-btn", `icon-btn--${variant}`, className ?? ""].filter(Boolean).join(" ");

  return (
    <button type="button" className={classes} {...rest}>
      {icon}
    </button>
  );
}
