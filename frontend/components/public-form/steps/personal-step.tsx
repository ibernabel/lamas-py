"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Home } from "lucide-react";
import { FullLoanApplicationFormValues } from "@/lib/validations/loan-application.schema";

interface PersonalStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function PersonalStep({ onNext, onBack }: PersonalStepProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useFormContext<FullLoanApplicationFormValues>();

  const housingType = watch("profile.housing_type");

  const handleContinue = async () => {
    const isStepValid = await trigger([
      "profile.marital_status",
      "profile.housing_type",
      "profile.housing_monthly_payment",
      "profile.time_at_residence_months",
      "profile.dependents_count",
      "profile.education_level",
    ]);

    if (isStepValid) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Home className="h-6 w-6 text-primary" />
          Paso 2: Perfil y Vivienda
        </h2>
        <p className="text-sm text-muted-foreground">
          Indique su situación habitacional, estado civil y dependientes.
        </p>
      </div>

      <div className="space-y-4">
        {/* Marital Status & Education */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="marital-status">Estado Civil</Label>
            <select
              id="marital-status"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("profile.marital_status")}
            >
              <option value="">Seleccione...</option>
              <option value="single">Soltero(a)</option>
              <option value="married">Casado(a)</option>
              <option value="common_law">Unión Libre</option>
              <option value="divorced">Divorciado(a)</option>
              <option value="widowed">Viudo(a)</option>
            </select>
            {errors.profile?.marital_status && (
              <p className="text-xs text-destructive">{errors.profile.marital_status.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="education-level">Nivel Educativo</Label>
            <select
              id="education-level"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("profile.education_level")}
            >
              <option value="">Seleccione...</option>
              <option value="primary">Primaria</option>
              <option value="secondary">Secundaria</option>
              <option value="high_school">Bachillerato</option>
              <option value="technical">Técnico Superior</option>
              <option value="bachelor">Universitario / Licenciatura</option>
              <option value="postgraduate">Postgrado</option>
              <option value="master">Maestría</option>
              <option value="doctorate">Doctorado</option>
            </select>
            {errors.profile?.education_level && (
              <p className="text-xs text-destructive">{errors.profile.education_level.message}</p>
            )}
          </div>
        </div>

        {/* Housing Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="housing-type">Tipo de Vivienda</Label>
            <select
              id="housing-type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("profile.housing_type")}
            >
              <option value="">Seleccione...</option>
              <option value="owned">Propia (Pagada)</option>
              <option value="rented">Alquilada</option>
              <option value="mortgaged">Propia (Hipotecada)</option>
              <option value="family">Familiar</option>
            </select>
            {errors.profile?.housing_type && (
              <p className="text-xs text-destructive">{errors.profile.housing_type.message}</p>
            )}
          </div>

          {/* Conditional Housing Monthly Payment */}
          {housingType === "rented" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <Label htmlFor="housing-payment">Pago Mensual Alquiler (RD$)</Label>
              <Input
                id="housing-payment"
                type="number"
                placeholder="12000"
                {...register("profile.housing_monthly_payment", { valueAsNumber: true })}
                className={errors.profile?.housing_monthly_payment ? "border-destructive" : ""}
              />
              {errors.profile?.housing_monthly_payment && (
                <p className="text-xs text-destructive">
                  {errors.profile.housing_monthly_payment.message}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Residence Time & Dependents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="residence-time">Tiempo en la Vivienda (Meses)</Label>
            <Input
              id="residence-time"
              type="number"
              placeholder="24"
              {...register("profile.time_at_residence_months", { valueAsNumber: true })}
              className={errors.profile?.time_at_residence_months ? "border-destructive" : ""}
            />
            {errors.profile?.time_at_residence_months && (
              <p className="text-xs text-destructive">
                {errors.profile.time_at_residence_months.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dependents-count">Dependientes a Cargo</Label>
            <Input
              id="dependents-count"
              type="number"
              placeholder="2"
              {...register("profile.dependents_count", { valueAsNumber: true })}
              className={errors.profile?.dependents_count ? "border-destructive" : ""}
            />
            {errors.profile?.dependents_count && (
              <p className="text-xs text-destructive">{errors.profile.dependents_count.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 flex items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          &larr; Atrás
        </Button>
        <Button type="button" onClick={handleContinue}>
          Continuar a Empleo &rarr;
        </Button>
      </div>
    </div>
  );
}
