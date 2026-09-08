import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useBuilderForm } from "./useBuilderForm.js";
import { NamesStep } from "./steps/NamesStep.js";
import { DateTimeStep } from "./steps/DateTimeStep.js";
import { VenueStep } from "./steps/VenueStep.js";
import { GreetingStep } from "./steps/GreetingStep.js";
import { MusicStep } from "./steps/MusicStep.js";

const STEP_COMPONENTS = [NamesStep, DateTimeStep, VenueStep, GreetingStep, MusicStep];
const STEP_KEYS = ["names", "dateTime", "venue", "greeting", "music"];

export function BuilderScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mode, step, form, updateField, canGoNext, isLastStep, goNext, goBack, submit, submitting, error } =
    useBuilderForm();

  if (mode === "loading") return <p>{t("home.loading")}</p>;

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
    <div>
      <h2>{t(`builder.steps.${STEP_KEYS[step]}`)}</h2>
      {StepComponent ? <StepComponent form={form} onChange={updateField} /> : null}
      {error ? <p>{t("common.errorGeneric")}</p> : null}
      <div>
        {step > 0 ? <button onClick={goBack}>{t("builder.back")}</button> : null}
        <button onClick={handlePrimaryAction} disabled={!canGoNext || submitting}>
          {isLastStep ? t(mode === "edit" ? "builder.update" : "builder.save") : t("builder.next")}
        </button>
      </div>
    </div>
  );
}
