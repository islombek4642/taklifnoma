import { useTranslation } from "react-i18next";
import { MapPin } from "lucide-react";
import { Input } from "../../../components/Input.js";
import { TextArea } from "../../../components/TextArea.js";
import type { BuilderFormState } from "../builder-form.js";

interface Props {
  form: BuilderFormState;
  onChange: <K extends keyof BuilderFormState>(key: K, value: BuilderFormState[K]) => void;
}

export function VenueStep({ form, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      <Input
        label={t("builder.fields.venueName")}
        value={form.venueName}
        onChange={(e) => onChange("venueName", e.target.value)}
      />
      <TextArea
        label={t("builder.fields.venueAddress")}
        value={form.venueAddress}
        onChange={(e) => onChange("venueAddress", e.target.value)}
      />
      <Input
        label={t("builder.fields.mapUrl")}
        icon={<MapPin size={16} strokeWidth={1.5} />}
        value={form.mapUrl}
        onChange={(e) => onChange("mapUrl", e.target.value)}
      />
    </div>
  );
}
