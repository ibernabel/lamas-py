"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";
import { FullLoanApplicationFormValues } from "@/lib/validations/loan-application.schema";

interface EmploymentStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function EmploymentStep({ onNext, onBack }: EmploymentStepProps) {
  const {
    register,
    formState: { errors },
    trigger,
  } = useFormContext<FullLoanApplicationFormValues>();

  const handleContinue = async () => {
    const isStepValid = await trigger([
      "job.occupation_type",
      "job.company_name",
      "job.role",
      "job.salary",
      "job.payment_frequency",
      "job.payment_bank",
      "job.employment_start_date",
    ]);

    if (isStepValid) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          Paso 3: Información Laboral
        </h2>
        <p className="text-sm text-muted-foreground">
          Suministre los detalles sobre su empleo actual o actividad económica.
        </p>
      </div>

      <div className="space-y-4">
        {/* Occupation Type & Cargo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="occupation-type">Tipo de Ocupación</Label>
            <select
              id="occupation-type"
              className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("job.occupation_type")}
            >
              <option value="" className="bg-background text-foreground">Seleccione...</option>
              <option value="employed" className="bg-background text-foreground">Empleado Privado / Público</option>
              <option value="independent" className="bg-background text-foreground">Profesional Independiente</option>
              <option value="business_owner" className="bg-background text-foreground">Dueño de Empresa / Negocio</option>
              <option value="other" className="bg-background text-foreground">Otro</option>
            </select>
            {errors.job?.occupation_type && (
              <p className="text-xs text-destructive">{errors.job.occupation_type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-role">Cargo / Puesto de Trabajo</Label>
            <Input
              id="job-role"
              placeholder="Analista Senior / Gerente"
              {...register("job.role")}
              className={errors.job?.role ? "border-destructive" : ""}
            />
            {errors.job?.role && (
              <p className="text-xs text-destructive">{errors.job.role.message}</p>
            )}
          </div>
        </div>

        {/* Company Name & RNC */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Nombre de la Empresa u Organización</Label>
            <Input
              id="company-name"
              placeholder="Banco BHD León / Claro RD"
              {...register("job.company_name")}
              className={errors.job?.company_name ? "border-destructive" : ""}
            />
            {errors.job?.company_name && (
              <p className="text-xs text-destructive">{errors.job.company_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-rnc">RNC de la Empresa (Opcional)</Label>
            <Input
              id="company-rnc"
              placeholder="1-01-01001-7"
              {...register("job.company_rnc")}
            />
          </div>
        </div>

        {/* Salary & Payment Bank */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="job-salary">Salario Mensual Bruto (RD$)</Label>
            <Input
              id="job-salary"
              type="number"
              placeholder="55000"
              {...register("job.salary", { valueAsNumber: true })}
              className={errors.job?.salary ? "border-destructive" : ""}
            />
            {errors.job?.salary && (
              <p className="text-xs text-destructive">{errors.job.salary.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-bank">Banco donde recibe la Nómina</Label>
            <select
              id="payment-bank"
              className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("job.payment_bank")}
            >
              <option value="" className="bg-background text-foreground">Seleccione...</option>
              <option value="BANRESERVAS" className="bg-background text-foreground">Banreservas</option>
              <option value="POPULAR" className="bg-background text-foreground">Banco Popular Dominicano</option>
              <option value="BHD" className="bg-background text-foreground">Banco BHD</option>
              <option value="SCOTIABANK" className="bg-background text-foreground">Scotiabank</option>
              <option value="SANTA_CRUZ" className="bg-background text-foreground">Banco Santa Cruz</option>
              <option value="PROMERICA" className="bg-background text-foreground">Banco Promerica</option>
              <option value="OTHER" className="bg-background text-foreground">Otro Banco / Efectivo</option>
            </select>
            {errors.job?.payment_bank && (
              <p className="text-xs text-destructive">{errors.job.payment_bank.message}</p>
            )}
          </div>
        </div>

        {/* Payment Frequency & Start Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="payment-frequency">Frecuencia de Cobro / Pago</Label>
            <select
              id="payment-frequency"
              className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("job.payment_frequency")}
            >
              <option value="" className="bg-background text-foreground">Seleccione...</option>
              <option value="fortnightly" className="bg-background text-foreground">Quincenal</option>
              <option value="monthly" className="bg-background text-foreground">Mensual</option>
              <option value="weekly" className="bg-background text-foreground">Semanal</option>
              <option value="daily" className="bg-background text-foreground">Diario</option>
            </select>
            {errors.job?.payment_frequency && (
              <p className="text-xs text-destructive">{errors.job.payment_frequency.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="employment-start-date">Fecha de Ingreso Laboral</Label>
            <Input
              id="employment-start-date"
              type="date"
              {...register("job.employment_start_date")}
              className={errors.job?.employment_start_date ? "border-destructive" : ""}
            />
            {errors.job?.employment_start_date && (
              <p className="text-xs text-destructive">{errors.job.employment_start_date.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 flex items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          &larr; Atrás
        </Button>
        <Button type="button" onClick={handleContinue}>
          Continuar a Situación Financiera &rarr;
        </Button>
      </div>
    </div>
  );
}
