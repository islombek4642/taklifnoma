import { useTranslation } from "react-i18next";
import { TextArea } from "../../../components/TextArea.js";
import type { BuilderFormState } from "../builder-form.js";

interface Props {
  form: BuilderFormState;
  onChange: <K extends keyof BuilderFormState>(key: K, value: BuilderFormState[K]) => void;
}

export function GreetingStep({ form, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <TextArea
      label={t("builder.fields.greetingText")}
      value={form.greetingText}
      onChange={(e) => onChange("greetingText", e.target.value)}
    />
  );
}
