import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiClient, type TemplateDto } from "../../../services/api-client.js";
import { TemplateCard } from "./TemplateCard.js";
import type { BuilderFormState } from "../builder-form.js";
import "./TemplateStep.css";

interface Props {
  form: BuilderFormState;
  onChange: <K extends keyof BuilderFormState>(key: K, value: BuilderFormState[K]) => void;
}

type LoadState = { status: "loading" } | { status: "ready"; templates: TemplateDto[] } | { status: "error" };

export function TemplateStep({ form, onChange }: Props) {
  const { t } = useTranslation();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    apiClient
      .getTemplates()
      .then((templates) => {
        if (!cancelled) setState({ status: "ready", templates });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") return <p className="template-step__hint">{t("home.loading")}</p>;
  if (state.status === "error") return <p className="template-step__hint">{t("common.errorGeneric")}</p>;

  return (
    <div>
      <p className="template-step__hint">{t("builder.fields.template")}</p>
      <div role="radiogroup" aria-label={t("builder.fields.template")}>
        {state.templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            selected={form.templateId === template.id}
            onSelect={() => onChange("templateId", template.id)}
          />
        ))}
      </div>
    </div>
  );
}
