"use client";

import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileCheck2, UploadCloud, FileText, Loader2 } from "lucide-react";
import { FullLoanApplicationFormValues } from "@/lib/validations/loan-application.schema";
import Link from "next/link";

interface RequestConsentStepProps {
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function RequestConsentStep({ onBack, onSubmit, isSubmitting }: RequestConsentStepProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useFormContext<FullLoanApplicationFormValues>();

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const privacyAccepted = watch("legal_consent.privacy_consent_accepted");
  const bureauAccepted = watch("legal_consent.bureau_authorization_accepted");
  const aiAccepted = watch("legal_consent.ai_processing_accepted");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleFormSubmit = async () => {
    const isStepValid = await trigger([
      "loan_request.amount",
      "loan_request.term_months",
      "loan_request.purpose",
      "legal_consent.privacy_consent_accepted",
      "legal_consent.bureau_authorization_accepted",
      "legal_consent.ai_processing_accepted",
    ]);

    if (isStepValid) {
      onSubmit();
    }
  };

  const toggleAllConsent = (checked: boolean) => {
    setValue("legal_consent.privacy_consent_accepted", checked, { shouldValidate: true });
    setValue("legal_consent.bureau_authorization_accepted", checked, { shouldValidate: true });
    setValue("legal_consent.ai_processing_accepted", checked, { shouldValidate: true });
  };

  const allAccepted = Boolean(privacyAccepted && bureauAccepted && aiAccepted);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <FileCheck2 className="h-6 w-6 text-primary" />
          Paso 5: Solicitud y Autorización Legal (Ley 172-13)
        </h2>
        <p className="text-sm text-muted-foreground">
          Especifique el monto deseado, adjunte documentos y firme la autorización legal.
        </p>
      </div>

      <div className="space-y-4">
        {/* Loan Amount & Term */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="loan-amount">Monto Solicitado (RD$)</Label>
            <Input
              id="loan-amount"
              type="number"
              placeholder="100000"
              {...register("loan_request.amount", { valueAsNumber: true })}
              className={errors.loan_request?.amount ? "border-destructive" : ""}
            />
            {errors.loan_request?.amount && (
              <p className="text-xs text-destructive">{errors.loan_request.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="loan-term">Plazo (Meses)</Label>
            <select
              id="loan-term"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("loan_request.term_months", { valueAsNumber: true })}
            >
              <option value="6">6 meses</option>
              <option value="12">12 meses</option>
              <option value="18">18 meses</option>
              <option value="24">24 meses</option>
              <option value="36">36 meses</option>
              <option value="48">48 meses</option>
              <option value="60">60 meses</option>
            </select>
            {errors.loan_request?.term_months && (
              <p className="text-xs text-destructive">{errors.loan_request.term_months.message}</p>
            )}
          </div>
        </div>

        {/* Loan Purpose */}
        <div className="space-y-2">
          <Label htmlFor="loan-purpose">Propósito del Préstamo</Label>
          <select
            id="loan-purpose"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...register("loan_request.purpose")}
          >
            <option value="">Seleccione...</option>
            <option value="RENOVATION">Remodelación o Vivienda</option>
            <option value="DEBT_CONSOLIDATION">Consolidación de Deudas</option>
            <option value="VEHICLE">Compra de Vehículo</option>
            <option value="BUSINESS">Inversión en Negocio</option>
            <option value="MEDICAL">Gastos Médicos / Salud</option>
            <option value="PERSONAL">Uso Personal / Viaje</option>
          </select>
          {errors.loan_request?.purpose && (
            <p className="text-xs text-destructive">{errors.loan_request.purpose.message}</p>
          )}
        </div>

        {/* Dropzone Upload Component */}
        <div className="space-y-2">
          <Label>Documentos Adjuntos (Cédula de Identidad, Carta de Trabajo, Comprobante de Ingresos)</Label>
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-6 text-center bg-muted/10 hover:border-primary/50 transition-colors">
            <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground">
              Arrastre sus archivos aquí o haga clic para examinar
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Soporta imágenes (PNG, JPG) y documentos PDF (máx. 10MB por archivo)
            </p>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="mt-3 block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
            />
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-xs font-semibold text-foreground">Archivos seleccionados:</p>
              <ul className="text-xs space-y-1">
                {uploadedFiles.map((file, idx) => (
                  <li key={idx} className="flex items-center text-muted-foreground gap-2">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span>{file.name}</span>
                    <span className="text-[10px]">({Math.round(file.size / 1024)} KB)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Legal Consent Box */}
        <div className="p-4 border rounded-xl bg-primary/5 border-primary/20 space-y-3">
          <div className="flex items-start space-x-3 cursor-pointer">
            <Checkbox
              id="legal-consent-all"
              checked={allAccepted}
              onCheckedChange={(checked) => toggleAllConsent(checked)}
              className="mt-1"
            />
            <label htmlFor="legal-consent-all" className="text-xs leading-relaxed text-foreground cursor-pointer font-medium">
              Declaro que la información suministrada es veraz. Autorizo a la institución a consultar mi historial crediticio en los burós (<strong>Ley 172-13 de Protección de Datos de RD</strong>) y a recopilar, almacenar y procesar mis datos mediante sistemas de <strong>Inteligencia Artificial</strong> (con anonimización estricta de PII) para la evaluación de riesgo.
            </label>
          </div>

          <div className="text-[11px] text-muted-foreground flex gap-4 pt-1">
            <Link href="/privacidad" target="_blank" className="underline hover:text-primary">
              Ver Política de Privacidad (Ley 172-13)
            </Link>
            <Link href="/terminos" target="_blank" className="underline hover:text-primary">
              Ver Términos del Servicio
            </Link>
          </div>

          {(errors.legal_consent?.privacy_consent_accepted ||
            errors.legal_consent?.bureau_authorization_accepted ||
            errors.legal_consent?.ai_processing_accepted) && (
            <p className="text-xs text-destructive font-medium">
              Debe marcar la casilla de declaración y autorización legal para enviar su solicitud.
            </p>
          )}
        </div>
      </div>

      <div className="pt-4 flex items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          &larr; Atrás
        </Button>
        <Button
          type="button"
          onClick={handleFormSubmit}
          disabled={isSubmitting || !allAccepted}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando Solicitud...
            </>
          ) : (
            "Enviar Solicitud de Préstamo"
          )}
        </Button>
      </div>
    </div>
  );
}
