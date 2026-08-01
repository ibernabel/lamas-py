"use client";

import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  fullLoanApplicationSchema,
  FullLoanApplicationFormValues,
} from "@/lib/validations/loan-application.schema";
import { IdentificationStep } from "@/components/public-form/steps/identification-step";
import { PersonalStep } from "@/components/public-form/steps/personal-step";
import { EmploymentStep } from "@/components/public-form/steps/employment-step";
import { FinancialsStep } from "@/components/public-form/steps/financials-step";
import { RequestConsentStep } from "@/components/public-form/steps/request-consent-step";
import { useFormTelemetry } from "@/hooks/use-form-telemetry";
import { sendWidgetEvent } from "@/lib/embed/post-message";
import { api } from "@/lib/api";
import { cleanNid } from "@/lib/utils/format-nid";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const TOTAL_STEPS = 5;

const STEP_NAMES: Record<number, string> = {
  1: "Identificación",
  2: "Perfil y Vivienda",
  3: "Empleo",
  4: "Finanzas",
  5: "Solicitud y Consentimiento",
};

export default function SolicitarPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedApplicationId, setSubmittedApplicationId] = useState<number | null>(null);

  const { recordStepTransition, getTelemetryPayload } = useFormTelemetry();

  const methods = useForm<FullLoanApplicationFormValues>({
    resolver: zodResolver(fullLoanApplicationSchema) as any,
    mode: "onBlur",
    defaultValues: {
      identity: {
        nid: "",
        first_name: "",
        last_name: "",
        mobile_phone: "",
        email: "",
      },
      profile: {
        marital_status: undefined,
        housing_type: undefined,
        housing_monthly_payment: undefined,
        time_at_residence_months: undefined,
        dependents_count: undefined,
        education_level: undefined,
      },
      job: {
        occupation_type: undefined,
        company_name: "",
        company_rnc: "",
        role: "",
        salary: undefined,
        payment_bank: "",
        employment_start_date: "",
      },
      financial: {
        other_income: 0,
        other_income_source: "",
        has_vehicle: false,
        has_property: false,
        informal_debts: 0,
      },
      loan_request: {
        amount: undefined,
        term_months: undefined,
        purpose: "",
        is_debt_consolidation: false,
      },
      legal_consent: {
        privacy_consent_accepted: undefined,
        bureau_authorization_accepted: undefined,
        ai_processing_accepted: undefined,
      },
    },
  });

  useEffect(() => {
    sendWidgetEvent({
      type: "FORM_LOADED",
      version: "2.0",
      timestamp: new Date().toISOString(),
    });
  }, []);

  const goToNextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      const fromKey = `step${currentStep}`;
      const toKey = `step${currentStep + 1}`;
      recordStepTransition(fromKey, toKey);

      const nextStepNum = currentStep + 1;
      setCurrentStep(nextStepNum);

      sendWidgetEvent({
        type: "STEP_CHANGED",
        currentStep: nextStepNum,
        totalSteps: TOTAL_STEPS,
        stepName: STEP_NAMES[nextStepNum],
        timestamp: new Date().toISOString(),
      });
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      const fromKey = `step${currentStep}`;
      const toKey = `step${currentStep - 1}`;
      recordStepTransition(fromKey, toKey);

      const prevStepNum = currentStep - 1;
      setCurrentStep(prevStepNum);

      sendWidgetEvent({
        type: "STEP_CHANGED",
        currentStep: prevStepNum,
        totalSteps: TOTAL_STEPS,
        stepName: STEP_NAMES[prevStepNum],
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formValues = methods.getValues();
      const telemetry = getTelemetryPayload();

      const payload = {
        ...formValues,
        identity: {
          ...formValues.identity,
          nid: cleanNid(formValues.identity?.nid),
        },
        telemetry,
        legal_consent: {
          ...formValues.legal_consent,
          consent_timestamp: new Date().toISOString(),
        },
      };

      const response = await api.post("/loan-applications/submit", payload);

      if (response.data && response.data.loan_application_id) {
        const appId = response.data.loan_application_id;
        const custId = response.data.customer_id;
        setSubmittedApplicationId(appId);

        sendWidgetEvent({
          type: "FORM_COMPLETED",
          loanApplicationId: appId,
          customerId: custId,
          status: "submitted",
          timestamp: new Date().toISOString(),
        });

        toast.success("¡Solicitud enviada exitosamente!");
      }
    } catch (error: any) {
      console.error("Error submitting loan application:", error);
      toast.error("Ocurrió un error al procesar la solicitud. Intente nuevamente.");

      sendWidgetEvent({
        type: "FORM_ERROR",
        errorCode: "SUBMIT_FAILED",
        errorMessage: error.response?.data?.detail || "Error en el servidor",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedApplicationId) {
    return (
      <Card className="w-full max-w-2xl border flex flex-col items-center text-center p-8 sm:p-12 shadow-lg">
        <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center text-emerald-600 mb-6">
          <CheckCircle className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">¡Solicitud Recibida con Éxito!</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          Su solicitud de préstamo #<strong>{submittedApplicationId}</strong> ha sido registrada exitosamente. Un oficial de crédito evaluará su perfil y se pondrá en contacto a la brevedad.
        </p>
        <div className="mt-8 p-4 bg-muted/40 rounded-lg border text-xs text-muted-foreground flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Verificación y análisis automático en proceso bajo la Ley 172-13.</span>
        </div>
      </Card>
    );
  }

  const progressPercentage = Math.round((currentStep / TOTAL_STEPS) * 100);

  return (
    <div className="w-full max-w-3xl space-y-4">
      {/* Progress Header */}
      <div className="bg-card border rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>PASO {currentStep} DE {TOTAL_STEPS}: {STEP_NAMES[currentStep].toUpperCase()}</span>
          <span>{progressPercentage}% COMPLETADO</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Main Form Card */}
      <Card className="shadow-md">
        <CardContent className="p-6 sm:p-8">
          <FormProvider {...methods}>
            <form onSubmit={(e) => e.preventDefault()}>
              {currentStep === 1 && <IdentificationStep onNext={goToNextStep} />}
              {currentStep === 2 && <PersonalStep onNext={goToNextStep} onBack={goToPrevStep} />}
              {currentStep === 3 && <EmploymentStep onNext={goToNextStep} onBack={goToPrevStep} />}
              {currentStep === 4 && <FinancialsStep onNext={goToNextStep} onBack={goToPrevStep} />}
              {currentStep === 5 && (
                <RequestConsentStep
                  onBack={goToPrevStep}
                  onSubmit={handleFinalSubmit}
                  isSubmitting={isSubmitting}
                />
              )}
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
