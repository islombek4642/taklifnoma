import { useTranslation } from "react-i18next";
import { Input } from "../../../components/Input.js";
import type { BuilderFormState } from "../builder-form.js";

interface Props {
  form: BuilderFormState;
  onChange: <K extends keyof BuilderFormState>(key: K, value: BuilderFormState[K]) => void;
}

export function DateTimeStep({ form, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      <Input
        label={t("builder.fields.eventDate")}
        type="date"
        value={form.eventDate}
        onChange={(e) => onChange("eventDate", e.target.value)}
      />
      <Input
        label={t("builder.fields.eventTime")}
        type="time"
        value={form.eventTime}
        onChange={(e) => onChange("eventTime", e.target.value)}
      />
    </div>
  );
}
