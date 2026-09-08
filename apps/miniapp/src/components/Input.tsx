import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import "./Field.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
}

export function Input({ label, icon, id, className, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label className="field" htmlFor={inputId}>
      <span className="field__label">{label}</span>
      <span className={["field__control", icon ? "field__control--with-icon" : "", className ?? ""].filter(Boolean).join(" ")}>
        {icon ? <span className="field__icon">{icon}</span> : null}
        <input id={inputId} className="field__input" {...rest} />
      </span>
    </label>
  );
}
