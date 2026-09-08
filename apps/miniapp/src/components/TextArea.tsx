import { useId, type TextareaHTMLAttributes } from "react";
import "./Field.css";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function TextArea({ label, id, className, ...rest }: TextAreaProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label className="field" htmlFor={inputId}>
      <span className="field__label">{label}</span>
      <textarea id={inputId} className={["field__textarea", className ?? ""].filter(Boolean).join(" ")} {...rest} />
    </label>
  );
}
