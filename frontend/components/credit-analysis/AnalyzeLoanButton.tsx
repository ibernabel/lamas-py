"use client";

import { useTriggerCreditGraph } from "@/hooks/use-creditgraph";
import { Button } from "@/components/ui/button";
import { Zap, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyzeLoanButtonProps {
  loanId: number;
  status: string;
  hasExistingAnalysis?: boolean;
  variant?: "default" | "outline" | "ghost" | "secondary";
  className?: string;
}

export function AnalyzeLoanButton({ 
  loanId, 
  status, 
  hasExistingAnalysis = false,
  variant = "default",
  className
}: AnalyzeLoanButtonProps) {
  const { mutate: triggerAnalyze, isPending } = useTriggerCreditGraph();

  const handleAnalyze = () => {
    triggerAnalyze({ loanId, force: hasExistingAnalysis });
  };

  const isCompleted = status === "approved" || status === "rejected" || status === "archived";

  return (
    <Button
      variant={hasExistingAnalysis ? "outline" : variant}
      size="sm"
      className={cn(
        "gap-2 font-bold",
        !hasExistingAnalysis && "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm",
        className
      )}
      onClick={handleAnalyze}
      disabled={isPending || isCompleted}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : hasExistingAnalysis ? (
        <RotateCcw className="h-4 w-4" />
      ) : (
        <Zap className="h-4 w-4 fill-white" />
      )}
      {isPending 
        ? "Analyzing..." 
        : hasExistingAnalysis 
          ? "Re-Analyze" 
          : "Analyze with CreditGraph"
      }
    </Button>
  );
}
