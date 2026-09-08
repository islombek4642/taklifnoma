import type { HTMLAttributes } from "react";
import "./Card.css";

type CardElevation = "sm" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: CardElevation;
}

export function Card({ elevation = "sm", className, children, ...rest }: CardProps) {
  const classes = ["card", `card--${elevation}`, className ?? ""].filter(Boolean).join(" ");

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
