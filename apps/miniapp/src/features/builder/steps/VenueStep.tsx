import { useTranslation } from "react-i18next";
import type { BuilderFormState } from "../builder-form.js";

interface Props {
  form: BuilderFormState;
  onChange: <K extends keyof BuilderFormState>(key: K, value: BuilderFormState[K]) => void;
}

export function VenueStep({ form, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      <label>
        {t("builder.fields.venueName")}
        <input value={form.venueName} onChange={(e) => onChange("venueName", e.target.value)} />
      </label>
      <label>
        {t("builder.fields.venueAddress")}
        <input value={form.venueAddress} onChange={(e) => onChange("venueAddress", e.target.value)} />
      </label>
      <label>
        {t("builder.fields.mapUrl")}
        <input value={form.mapUrl} onChange={(e) => onChange("mapUrl", e.target.value)} />
      </label>
    </div>
  );
}
