import { useTranslation } from "react-i18next";
import type { BuilderFormState } from "../builder-form.js";

interface Props {
  form: BuilderFormState;
  onChange: <K extends keyof BuilderFormState>(key: K, value: BuilderFormState[K]) => void;
}

export function DateTimeStep({ form, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      <label>
        {t("builder.fields.eventDate")}
        <input type="date" value={form.eventDate} onChange={(e) => onChange("eventDate", e.target.value)} />
      </label>
      <label>
        {t("builder.fields.eventTime")}
        <input type="time" value={form.eventTime} onChange={(e) => onChange("eventTime", e.target.value)} />
      </label>
    </div>
  );
}
