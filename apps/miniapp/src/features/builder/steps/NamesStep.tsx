import { useTranslation } from "react-i18next";
import { Input } from "../../../components/Input.js";
import type { BuilderFormState } from "../builder-form.js";

interface Props {
  form: BuilderFormState;
  onChange: <K extends keyof BuilderFormState>(key: K, value: BuilderFormState[K]) => void;
}

export function NamesStep({ form, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      <Input
        label={t("builder.fields.groomName")}
        value={form.groomName}
        onChange={(e) => onChange("groomName", e.target.value)}
      />
      <Input
        label={t("builder.fields.brideName")}
        value={form.brideName}
        onChange={(e) => onChange("brideName", e.target.value)}
      />
    </div>
  );
}
