import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import { useBuilderForm } from "./useBuilderForm.js";
import { NamesStep } from "./steps/NamesStep.js";
import { DateTimeStep } from "./steps/DateTimeStep.js";
import { VenueStep } from "./steps/VenueStep.js";
import { GreetingStep } from "./steps/GreetingStep.js";
import { MusicStep } from "./steps/MusicStep.js";
import { TopBar } from "../../components/TopBar.js";
import { ProgressSteps } from "../../components/ProgressSteps.js";
import { Button } from "../../components/Button.js";
import { BUILDER_STEP_COUNT } from "./builder-form.js";
import "./BuilderScreen.css";

const STEP_COMPONENTS = [NamesStep, DateTimeStep, VenueStep, GreetingStep, MusicStep];
const STEP_KEYS = ["names", "dateTime", "venue", "greeting", "music"];

export function BuilderScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mode, step, form, updateField, canGoNext, isLastStep, goNext, goBack, submit, submitting, error } =
    useBuilderForm();

  if (mode === "loading") return <p className="builder-status-text">{t("home.loading")}</p>;

  const StepComponent = STEP_COMPONENTS[step];

  async function handlePrimaryAction() {
    if (!isLastStep) {
      goNext();
      return;
    }
    const invitation = await submit();
    if (invitation) navigate("/builder/result", { state: invitation });
  }

  return (
    <div className="builder-screen page-transition">
      <div className="builder-screen__header">
        <TopBar
          title={t(`builder.steps.${STEP_KEYS[step]}`)}
          eyebrow={t("builder.stepOf", { current: step + 1, total: BUILDER_STEP_COUNT })}
          onBack={step > 0 ? goBack : undefined}
          backLabel={t("builder.back")}
        />
        <ProgressSteps total={BUILDER_STEP_COUNT} current={step} />
      </div>

      <div key={step} className="builder-screen__body page-transition">
        {StepComponent ? <StepComponent form={form} onChange={updateField} /> : null}
        {error ? <p className="builder-screen__error">{t("common.errorGeneric")}</p> : null}
      </div>

      <div className="builder-screen__footer">
        {step > 0 ? (
          <Button variant="soft" onClick={goBack}>
            {t("builder.back")}
          </Button>
        ) : null}
        <Button
          fullWidth={step === 0}
          icon={isLastStep ? undefined : <ChevronRight size={16} strokeWidth={1.8} />}
          onClick={handlePrimaryAction}
          disabled={!canGoNext || submitting}
        >
          {isLastStep ? t(mode === "edit" ? "builder.update" : "builder.save") : t("builder.next")}
        </Button>
      </div>
    </div>
  );
}
