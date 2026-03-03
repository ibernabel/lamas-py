import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertCircle, CheckCircle, Info, Zap } from "lucide-react";
import type { CreditGraphAnalysisRead } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface DecisionSummaryCardProps {
  analysis: CreditGraphAnalysisRead;
}

export function DecisionSummaryCard({ analysis }: DecisionSummaryCardProps) {
  const getStatusConfig = () => {
    switch (analysis.decision) {
      case "APPROVED":
        return {
          icon: <CheckCircle className="h-6 w-6 text-emerald-500" />,
          bgColor: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800",
          textColor: "text-emerald-700 dark:text-emerald-400",
          label: "AUTO-APPROVED",
        };
      case "APPROVED_PENDING_REVIEW":
        return {
          icon: <CheckCircle className="h-6 w-6 text-blue-500" />,
          bgColor: "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800",
          textColor: "text-blue-700 dark:text-blue-400",
          label: "APPROVED (PENDING REVIEW)",
        };
      case "REJECTED":
        return {
          icon: <AlertCircle className="h-6 w-6 text-rose-500" />,
          bgColor: "bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800",
          textColor: "text-rose-700 dark:text-rose-400",
          label: "REJECTED",
        };
      case "MANUAL_REVIEW":
      default:
        return {
          icon: <Info className="h-6 w-6 text-amber-500" />,
          bgColor: "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800",
          textColor: "text-amber-700 dark:text-amber-400",
          label: "MANUAL REVIEW REQUIRED",
        };
    }
  };

  const config = getStatusConfig();
  const confidencePercent = Math.round(analysis.confidence * 100);

  return (
    <Card className={cn("overflow-hidden border-2", config.bgColor)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-white dark:bg-slate-900 shadow-sm">
            {config.icon}
          </div>
          <div>
            <CardTitle className={cn("text-xl font-bold", config.textColor)}>
              {config.label}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Case ID: <span className="font-mono">{analysis.case_id}</span>
            </p>
          </div>
        </div>
        <Badge variant="outline" className="bg-white/50 dark:bg-black/20">
          <Zap className="h-3 w-3 mr-1 text-amber-500 fill-amber-500" />
          AI Driven
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" /> IRS Global Score
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black">{analysis.irs_score}</span>
              <span className="text-sm text-muted-foreground font-medium">/ 100</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Confidence Level</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-white/50 dark:bg-black/20 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    confidencePercent > 80 ? "bg-emerald-500" : "bg-amber-500"
                  )}
                  style={{ width: `${confidencePercent}%` }}
                />
              </div>
              <span className="text-sm font-bold">{confidencePercent}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Risk Category</p>
            <Badge 
              className={cn(
                "px-3 py-1 text-xs font-bold uppercase",
                analysis.risk_level === "LOW" && "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
                analysis.risk_level === "MEDIUM" && "bg-amber-100 text-amber-800 hover:bg-amber-100",
                analysis.risk_level === "HIGH" && "bg-orange-100 text-orange-800 hover:bg-orange-100",
                analysis.risk_level === "CRITICAL" && "bg-rose-100 text-rose-800 hover:bg-rose-100",
              )}
            >
              {analysis.risk_level} Risk
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
