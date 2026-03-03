import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, AlertTriangle, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import type { CreditGraphAnalysisRead } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface FinancialFindingsProps {
  analysis: CreditGraphAnalysisRead;
}

export function FinancialFindings({ analysis }: FinancialFindingsProps) {
  const findings = analysis.full_response.financial_analysis || {
    detected_income: 0,
    reported_income: 0,
    discrepancy_ratio: 0,
    flags: [],
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

  const isIncomeHigh = findings.detected_income >= findings.reported_income;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5" /> Financial Analysis
        </CardTitle>
        <CardDescription>Income verification and cashflow flags</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border">
            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Reported</p>
            <p className="text-md font-bold text-slate-500">{formatCurrency(findings.reported_income)}</p>
          </div>
          <div className={cn(
            "p-3 rounded-lg border",
            isIncomeHigh ? "bg-emerald-50 border-emerald-100 dark:bg-emerald-950/10" : "bg-rose-50 border-rose-100 dark:bg-rose-950/10"
          )}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Detected</p>
              {isIncomeHigh ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-rose-500" />}
            </div>
            <p className={cn("text-md font-bold", isIncomeHigh ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400")}>
              {formatCurrency(findings.detected_income)}
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3 px-1">Risk Indicators</h4>
          <div className="space-y-2">
            {findings.flags && findings.flags.length > 0 ? (
              findings.flags.map((flag: string, i: number) => (
                <div key={i} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-900/20 p-2 rounded-md border text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <span>{flag}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 p-2 text-xs text-emerald-600 font-medium">
                <Check className="h-4 w-4" /> No high-risk financial flags detected.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
