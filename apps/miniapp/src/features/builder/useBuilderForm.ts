import { useEffect, useState } from "react";
import { apiClient, type InvitationDto } from "../../services/api-client.js";
import { getInitData } from "../../services/telegram.js";
import {
  BUILDER_STEP_COUNT,
  INITIAL_BUILDER_FORM_STATE,
  fromInvitation,
  isStepValid,
  toInvitationInput,
  type BuilderFormState,
} from "./builder-form.js";

export function useBuilderForm(initialTemplateId?: string) {
  const [mode, setMode] = useState<"loading" | "create" | "edit">("loading");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<BuilderFormState>(INITIAL_BUILDER_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiClient.getMyInvitation(getInitData()).then((invitation) => {
      if (invitation) {
        setForm(fromInvitation(invitation));
        setMode("edit");
      } else {
        // A template must already be picked (on the Home screen's gallery)
        // before the builder can be entered in create mode — there's no
        // step here to choose one anymore.
        setForm((prev) => ({ ...prev, templateId: initialTemplateId ?? "" }));
        setMode("create");
      }
    });
  }, []);

  function updateField<K extends keyof BuilderFormState>(key: K, value: BuilderFormState[K]): void {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const canGoNext = isStepValid(step, form);
  const isLastStep = step === BUILDER_STEP_COUNT - 1;

  function goNext(): void {
    if (canGoNext && step < BUILDER_STEP_COUNT - 1) setStep(step + 1);
  }

  function goBack(): void {
    if (step > 0) setStep(step - 1);
  }

  async function submit(): Promise<InvitationDto | undefined> {
    setSubmitting(true);
    setError(false);
    try {
      const input = toInvitationInput(form);
      const initData = getInitData();
      return mode === "edit" ? await apiClient.updateInvitation(initData, input) : await apiClient.createInvitation(initData, input);
    } catch {
      setError(true);
      return undefined;
    } finally {
      setSubmitting(false);
    }
  }

  return { mode, step, form, updateField, canGoNext, isLastStep, goNext, goBack, submit, submitting, error };
}
