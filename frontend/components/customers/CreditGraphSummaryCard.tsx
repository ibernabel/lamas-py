"use client";

import { BrainCircuit, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CreditGraphSummaryCardProps {
  score?: number;
  maxScore?: number;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
  recommendation?: string;
  monthlyPaymentCapacity?: number;
  onViewFullAnalysis?: () => void;
}

export function CreditGraphSummaryCard({
  score = 780,
  maxScore = 900,
  riskLevel = "LOW",
  recommendation = "Aprobación Sugerida",
  monthlyPaymentCapacity = 45000,
  onViewFullAnalysis,
}: CreditGraphSummaryCardProps) {
  const getRiskBadge = () => {
    switch (riskLevel) {
      case "LOW":
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30">Riesgo Bajo</Badge>;
      case "MEDIUM":
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 border-amber-500/30">Riesgo Moderado</Badge>;
      case "HIGH":
        return <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 hover:bg-rose-500/25 border-rose-500/30">Riesgo Alto</Badge>;
    }
  };

  const percentage = Math.round((score / maxScore) * 100);

  return (
    <Card className="border-primary/20 bg-linear-to-b from-primary/5 via-transparent to-transparent shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">CreditGraph AI</CardTitle>
          </div>
          {getRiskBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score gauge / metric display */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Score de Crédito</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold tracking-tight text-foreground">{score}</span>
              <span className="text-xs text-muted-foreground">/ {maxScore}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-primary">{percentage}% de Confianza</span>
            <p className="text-[11px] text-muted-foreground">Basado en 14 variables</p>
          </div>
        </div>

        {/* Dictamen */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dictamen IA</p>
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold">{recommendation}</span>
          </div>
        </div>

        {/* Highlighted Indicators */}
        <div className="space-y-2 pt-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Métricas Clave</p>
          <ul className="space-y-1.5 text-xs">
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Capacidad de Pago:
              </span>
              <span className="font-semibold">RD$ {monthlyPaymentCapacity.toLocaleString()}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Estabilidad Laboral:
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Alta</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Endeudamiento:
              </span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">Moderado (38%)</span>
            </li>
          </ul>
        </div>
      </CardContent>
      {onViewFullAnalysis && (
        <CardFooter className="pt-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between hover:bg-primary/10 hover:text-primary transition-colors text-xs"
            onClick={onViewFullAnalysis}
          >
            <span>Ver evaluación completa</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
