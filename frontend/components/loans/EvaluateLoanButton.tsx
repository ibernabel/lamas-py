"use client";

import { Sparkles, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCreditGraphAnalysis } from "@/hooks/use-creditgraph";
import type { LoanStatus } from "@/lib/api/types";

interface EvaluateLoanButtonProps {
  loanId: number;
  status: LoanStatus;
}

export function EvaluateLoanButton({ loanId }: Omit<EvaluateLoanButtonProps, "status">) {
  const { data: analysis, isLoading } = useCreditGraphAnalysis(loanId);
  const hasAnalysis = analysis && !("message" in analysis);

  if (isLoading) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Sparkles className="h-4 w-4 animate-pulse" />
        AI Engine...
      </Button>
    );
  }

  return (
    <Button
      asChild
      variant={hasAnalysis ? "default" : "outline"}
      className={cn(
        "gap-2",
        hasAnalysis 
          ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
          : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-400"
      )}
    >
      <Link href={`/loans/${loanId}/analysis`}>
        {hasAnalysis ? <Eye className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        {hasAnalysis ? "View AI Analysis" : "Analyze with AI"}
      </Link>
    </Button>
  );
}
