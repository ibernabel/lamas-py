import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquareQuote, ChevronRight } from "lucide-react";
import type { CreditGraphAnalysisRead } from "@/lib/api/types";

interface ReasoningNarrativeProps {
  analysis: CreditGraphAnalysisRead;
}

export function ReasoningNarrative({ analysis }: ReasoningNarrativeProps) {
  const narrative = analysis.full_response.narrative || "No narrative details found for this analysis.";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquareQuote className="h-5 w-5 text-indigo-500" /> AI Reasoning
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute -left-1 top-0 bottom-0 w-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-full" />
          <div className="pl-6 py-1">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic whitespace-pre-wrap">
              &quot;{narrative}&quot;
            </p>
          </div>
        </div>
        
        {analysis.suggested_amount && (
          <div className="mt-6 flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
              <ChevronRight className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Suggested Limit Adjustment</span>
            </div>
            <span className="text-md font-bold text-indigo-900 dark:text-indigo-300">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(analysis.suggested_amount)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
