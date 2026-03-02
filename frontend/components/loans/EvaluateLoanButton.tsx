"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useEvaluateLoan } from "@/hooks/use-loan-applications";
import type { LoanStatus } from "@/lib/api/types";

interface EvaluateLoanButtonProps {
  loanId: number;
  status: LoanStatus;
}

export function EvaluateLoanButton({ loanId, status }: EvaluateLoanButtonProps) {
  const evaluate = useEvaluateLoan();

  // Disabled in terminal states
  const isDisabled = ["approved", "rejected", "archived"].includes(status);

  return (
    <Button
      variant="outline"
      className="gap-2 border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
      onClick={() => evaluate.mutate(loanId)}
      disabled={isDisabled || evaluate.isPending}
    >
      {evaluate.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {evaluate.isPending ? "Queuing..." : "AI Evaluation"}
    </Button>
  );
}
