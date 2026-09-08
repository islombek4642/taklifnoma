import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";

export type ButtonVariant = "primary" | "outline" | "soft" | "text" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({ variant = "primary", icon, fullWidth, className, children, ...rest }: ButtonProps) {
  const classes = ["btn", `btn--${variant}`, fullWidth ? "btn--full" : "", className ?? ""].filter(Boolean).join(" ");

  return (
    <button className={classes} {...rest}>
      {icon}
      {children}
    </button>
  );
}
