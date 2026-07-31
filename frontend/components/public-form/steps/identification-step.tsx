"use client";

import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, User } from "lucide-react";
import { FullLoanApplicationFormValues } from "@/lib/validations/loan-application.schema";
import { api } from "@/lib/api";
import { formatNid, cleanNid } from "@/lib/utils/format-nid";

interface IdentificationStepProps {
  onNext: () => void;
}

export function IdentificationStep({ onNext }: IdentificationStepProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useFormContext<FullLoanApplicationFormValues>();

  const [isValidatingNid, setIsValidatingNid] = useState(false);
  const [nidValidated, setNidValidated] = useState(false);

  const nidValue = watch("identity.nid");

  const handleNidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNid(e.target.value);
    setValue("identity.nid", formatted, { shouldValidate: true });
    setNidValidated(false);
  };

  const handleNidBlur = async () => {
    const cleaned = cleanNid(nidValue);
    if (cleaned.length !== 11) return;

    setIsValidatingNid(true);
    try {
      // Clean NID for API lookup
      const response = await api.get(`/nid-validation/${cleaned}`).catch(() => null);

      if (response?.data) {
        if (response.data.first_name) {
          setValue("identity.first_name", response.data.first_name, { shouldValidate: true });
        }
        if (response.data.last_name) {
          setValue("identity.last_name", response.data.last_name, { shouldValidate: true });
        }
      }
      setNidValidated(true);
    } catch {
      // Silent fail fallback for manual entry
    } finally {
      setIsValidatingNid(false);
    }
  };

  const handleContinue = async () => {
    const isStepValid = await trigger([
      "identity.nid",
      "identity.first_name",
      "identity.last_name",
      "identity.mobile_phone",
      "identity.email",
    ]);

    if (isStepValid) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          Paso 1: Identificación Ciudadana
        </h2>
        <p className="text-sm text-muted-foreground">
          Ingrese su número de Cédula de Identidad para iniciar la solicitud.
        </p>
      </div>

      <div className="space-y-4">
        {/* NID Input */}
        <div className="space-y-2">
          <Label htmlFor="identity-nid">Cédula de Identidad (000-0000000-0)</Label>
          <div className="relative">
            <Input
              id="identity-nid"
              placeholder="001-0000001-1"
              value={nidValue || ""}
              onChange={handleNidChange}
              onBlur={handleNidBlur}
              className={errors.identity?.nid ? "border-destructive" : ""}
            />
            {isValidatingNid && (
              <div className="absolute right-3 top-2.5">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {nidValidated && !isValidatingNid && (
              <div className="absolute right-3 top-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            )}
          </div>
          {errors.identity?.nid && (
            <p className="text-xs text-destructive">{errors.identity.nid.message}</p>
          )}
        </div>

        {/* First & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="identity-firstname">Nombres</Label>
            <Input
              id="identity-firstname"
              placeholder="Juan"
              {...register("identity.first_name")}
              className={errors.identity?.first_name ? "border-destructive" : ""}
            />
            {errors.identity?.first_name && (
              <p className="text-xs text-destructive">{errors.identity.first_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="identity-lastname">Apellidos</Label>
            <Input
              id="identity-lastname"
              placeholder="Pérez Rodríguez"
              {...register("identity.last_name")}
              className={errors.identity?.last_name ? "border-destructive" : ""}
            />
            {errors.identity?.last_name && (
              <p className="text-xs text-destructive">{errors.identity.last_name.message}</p>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="identity-phone">Teléfono Móvil (WhatsApp)</Label>
            <Input
              id="identity-phone"
              placeholder="8095550001"
              {...register("identity.mobile_phone")}
              className={errors.identity?.mobile_phone ? "border-destructive" : ""}
            />
            {errors.identity?.mobile_phone && (
              <p className="text-xs text-destructive">{errors.identity.mobile_phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="identity-email">Correo Electrónico</Label>
            <Input
              id="identity-email"
              type="email"
              placeholder="juan.perez@gmail.com"
              {...register("identity.email")}
              className={errors.identity?.email ? "border-destructive" : ""}
            />
            {errors.identity?.email && (
              <p className="text-xs text-destructive">{errors.identity.email.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="button" onClick={handleContinue} className="w-full sm:w-auto">
          Continuar a Perfil y Vivienda &rarr;
        </Button>
      </div>
    </div>
  );
}
