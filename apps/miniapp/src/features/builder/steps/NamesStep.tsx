import { useTranslation } from "react-i18next";
import type { BuilderFormState } from "../builder-form.js";

interface Props {
  form: BuilderFormState;
  onChange: <K extends keyof BuilderFormState>(key: K, value: BuilderFormState[K]) => void;
}

export function NamesStep({ form, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      <label>
        {t("builder.fields.groomName")}
        <input value={form.groomName} onChange={(e) => onChange("groomName", e.target.value)} />
      </label>
      <label>
        {t("builder.fields.brideName")}
        <input value={form.brideName} onChange={(e) => onChange("brideName", e.target.value)} />
      </label>
    </div>
  );
}
