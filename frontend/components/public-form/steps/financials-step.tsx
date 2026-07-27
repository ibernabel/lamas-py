"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign } from "lucide-react";
import { FullLoanApplicationFormValues } from "@/lib/validations/loan-application.schema";

interface FinancialsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function FinancialsStep({ onNext, onBack }: FinancialsStepProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useFormContext<FullLoanApplicationFormValues>();

  const hasVehicle = watch("financial.has_vehicle");
  const hasProperty = watch("financial.has_property");

  const handleContinue = async () => {
    const isStepValid = await trigger([
      "financial.other_income",
      "financial.other_income_source",
      "financial.has_vehicle",
      "financial.has_property",
      "financial.informal_debts",
    ]);

    if (isStepValid) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary" />
          Paso 4: Situación Financiera y Bienes
        </h2>
        <p className="text-sm text-muted-foreground">
          Indique otros ingresos adicionales y activos patrimoniales.
        </p>
      </div>

      <div className="space-y-4">
        {/* Other Income */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="other-income">Otros Ingresos Mensuales (RD$)</Label>
            <Input
              id="other-income"
              type="number"
              placeholder="8000"
              {...register("financial.other_income", { valueAsNumber: true })}
              className={errors.financial?.other_income ? "border-destructive" : ""}
            />
            {errors.financial?.other_income && (
              <p className="text-xs text-destructive">{errors.financial.other_income.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="other-income-source">Fuente de Otros Ingresos</Label>
            <Input
              id="other-income-source"
              placeholder="Alquiler / Remesa / Trabajo independiente"
              {...register("financial.other_income_source")}
            />
          </div>
        </div>

        {/* Assets Checkboxes */}
        <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
          <Label className="text-sm font-semibold">Declaración de Activos</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <Checkbox
                id="has-vehicle-check"
                checked={hasVehicle || false}
                onCheckedChange={(checked) => setValue("financial.has_vehicle", checked)}
              />
              <span className="text-sm font-medium">Poseo vehículo propio</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <Checkbox
                id="has-property-check"
                checked={hasProperty || false}
                onCheckedChange={(checked) => setValue("financial.has_property", checked)}
              />
              <span className="text-sm font-medium">Poseo propiedad raíz o inmueble</span>
            </label>
          </div>
        </div>

        {/* Informal Debts */}
        <div className="space-y-2">
          <Label htmlFor="informal-debts">Estimado de Deudas Informales o Personales (RD$)</Label>
          <Input
            id="informal-debts"
            type="number"
            placeholder="0"
            {...register("financial.informal_debts", { valueAsNumber: true })}
            className={errors.financial?.informal_debts ? "border-destructive" : ""}
          />
          {errors.financial?.informal_debts && (
            <p className="text-xs text-destructive">{errors.financial.informal_debts.message}</p>
          )}
        </div>
      </div>

      <div className="pt-4 flex items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          &larr; Atrás
        </Button>
        <Button type="button" onClick={handleContinue}>
          Continuar a Solicitud y Firma Legal &rarr;
        </Button>
      </div>
    </div>
  );
}
