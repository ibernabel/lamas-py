"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTransitionLoanStatus } from "@/hooks/use-loan-applications";
import type { LoanStatus } from "@/lib/api/types";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n/use-translation";

interface StatusTransitionDialogProps {
  loanId: number;
  currentStatus: LoanStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const transitionLabels: Record<string, { es: string; en: string }> = {
  "verified": { es: "Verificar Solicitud", en: "Verify Application" },
  "assigned": { es: "Asignar a Analista", en: "Assign to Analyst" },
  "analyzed": { es: "Marcar como Analizada", en: "Mark as Analyzed" },
  "approved": { es: "Aprobar Préstamo", en: "Approve Loan" },
  "rejected": { es: "Rechazar Solicitud", en: "Reject Application" },
  "archived": { es: "Archivar Solicitud", en: "Archive Application" },
};

const nextStatusMap: Record<LoanStatus, LoanStatus[]> = {
  received: ["verified", "rejected"],
  verified: ["assigned", "rejected"],
  assigned: ["analyzed", "rejected"],
  analyzed: ["approved", "rejected"],
  approved: ["archived"],
  rejected: ["archived"],
  archived: [],
};

export function StatusTransitionDialog({
  loanId,
  currentStatus,
  open,
  onOpenChange,
}: StatusTransitionDialogProps) {
  const [targetStatus, setTargetStatus] = useState<LoanStatus | "">("");
  const [note, setNote] = useState("");
  const transition = useTransitionLoanStatus();
  const { t, language } = useTranslation();

  const nextTargets = nextStatusMap[currentStatus] || [];

  const handleTransition = () => {
    if (!targetStatus) return;

    transition.mutate(
      { id: loanId, status: targetStatus as LoanStatus, note: note || undefined },
      {
        onSuccess: () => {
          setTargetStatus("");
          setNote("");
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-112.5">
        <DialogHeader>
          <DialogTitle>{t("loans.changeStatus")}</DialogTitle>
          <DialogDescription>
            {language === "es"
              ? "Actualiza el estado de la solicitud dentro del flujo de trabajo."
              : "Change the current workflow state of this application."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="target-status">
              {language === "es" ? "Siguiente Estado" : "Next Status"}
            </Label>
            {nextTargets.length > 0 ? (
              <Select
                value={targetStatus}
                onValueChange={(v) => setTargetStatus(v as LoanStatus)}
              >
                <SelectTrigger id="target-status">
                  <SelectValue placeholder={language === "es" ? "— Seleccionar paso —" : "Select next step..."} />
                </SelectTrigger>
                <SelectContent>
                  {nextTargets.map((target) => {
                    const labelObj = transitionLabels[target];
                    const labelText = labelObj ? labelObj[language] : t(`status.${target}`, target);
                    return (
                      <SelectItem key={target} value={target}>
                        {labelText}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground bg-muted rounded-md border border-dashed">
                <AlertCircle className="h-4 w-4" />
                {language === "es"
                  ? `Esta solicitud está en un estado final (${t(`status.${currentStatus}`, currentStatus)}).`
                  : `This loan is in a terminal state (${currentStatus}).`}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status-note">
              {language === "es" ? "Motivo / Nota" : "Reason / Note"}{" "}
              <span className="text-muted-foreground font-normal">
                ({language === "es" ? "Opcional" : "Optional"})
              </span>
            </Label>
            <Textarea
              id="status-note"
              placeholder={language === "es" ? "Detalla el motivo del cambio de estado..." : "Provide a reason for this transition..."}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-20"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleTransition}
            disabled={!targetStatus || transition.isPending}
          >
            {transition.isPending
              ? t("common.loading")
              : language === "es"
              ? "Confirmar Cambio"
              : "Confirm Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
