"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoanApplication } from "@/hooks/use-loan-applications";
import { useCreditGraphAnalysis } from "@/hooks/use-creditgraph";
import { DecisionSummaryCard } from "@/components/credit-analysis/DecisionSummaryCard";
import { IRSBreakdownChart } from "@/components/credit-analysis/IRSBreakdownChart";
import { FinancialFindings } from "@/components/credit-analysis/FinancialFindings";
import { ReasoningNarrative } from "@/components/credit-analysis/ReasoningNarrative";
import { AnalyzeLoanButton } from "@/components/credit-analysis/AnalyzeLoanButton";
import { Alert, AlertDescription, AlertTitle } from "../../../../../components/ui/alert";
import type { CreditGraphAnalysisRead } from "@/lib/api/types";

export default function LoanAnalysisPage() {
  const { id } = useParams();
  const loanId = parseInt(id as string);

  const { data: loan, isLoading: loanLoading } = useLoanApplication(loanId);
  const { data: analysis, isLoading: analysisLoading, refetch } = useCreditGraphAnalysis(loanId);

  const isLoading = loanLoading || analysisLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48 col-span-3" />
          <Skeleton className="h-64 col-span-1" />
          <Skeleton className="h-64 col-span-2" />
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <h2 className="text-xl font-bold">Loan Application Not Found</h2>
        <Button asChild className="mt-4">
          <Link href="/loans">Back to Loans</Link>
        </Button>
      </div>
    );
  }

  const hasAnalysis = analysis && !("message" in analysis);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={`/loans/${loanId}`}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Loan #{loanId}
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Credit Analysis Dashboard</h1>
            <ShieldCheck className="h-6 w-6 text-indigo-500" />
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            AI-powered risk evaluation for {loan.customer_id ? `Customer #${loan.customer_id}` : "Applicant"}
          </p>
        </div>

        <div className="flex items-center gap-2">
            <AnalyzeLoanButton 
                loanId={loanId} 
                status={loan.status} 
                hasExistingAnalysis={hasAnalysis} 
            />
        </div>
      </div>

      {!hasAnalysis ? (
        <Alert className="bg-slate-50 border-dashed border-2">
          <Clock className="h-5 w-5 text-slate-500" />
          <AlertTitle className="font-bold">No Analysis Found</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            This loan application has not been analyzed by CreditGraph AI yet. 
            Click the button above to trigger the evaluation.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-3">
             <DecisionSummaryCard analysis={analysis as CreditGraphAnalysisRead} />
          </div>

          <div className="lg:col-span-1 h-full">
            <IRSBreakdownChart analysis={analysis as CreditGraphAnalysisRead} />
          </div>

          <div className="lg:col-span-1 h-full">
            <FinancialFindings analysis={analysis as CreditGraphAnalysisRead} />
          </div>

          <div className="lg:col-span-1 h-full">
             <ReasoningNarrative analysis={analysis as CreditGraphAnalysisRead} />
          </div>

          <div className="lg:col-span-3">
            <Alert variant="default" className="bg-indigo-50/50 border-indigo-100 flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                    <RefreshCw className="h-3 w-3 text-indigo-400" />
                    <span className="text-[10px] text-muted-foreground font-medium italic">
                        Last analysis completed on {new Date((analysis as CreditGraphAnalysisRead).analyzed_at).toLocaleString()} 
                        • Processing time: {(analysis as CreditGraphAnalysisRead).processing_time_ms}ms
                    </span>
                </div>
                <Button variant="link" size="sm" className="h-auto p-0 text-[10px] font-bold text-indigo-500" onClick={() => refetch()}>
                    Refresh Data
                </Button>
            </Alert>
          </div>
        </div>
      )}
    </div>
  );
}
