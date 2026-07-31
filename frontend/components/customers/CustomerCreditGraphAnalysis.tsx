"use client";

import { BrainCircuit, ShieldCheck, TrendingUp, AlertCircle, BarChart3, Wallet, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface CustomerCreditGraphAnalysisProps {
  customerId: number;
}

const mockRadarData = [
  { subject: "Solvencia", A: 85, fullMark: 100 },
  { subject: "Estabilidad Laboral", A: 90, fullMark: 100 },
  { subject: "Capacidad de Pago", A: 75, fullMark: 100 },
  { subject: "Historial de Crédito", A: 80, fullMark: 100 },
  { subject: "Garantías / Vehículo", A: 65, fullMark: 100 },
  { subject: "Bajo Endeudamiento", A: 70, fullMark: 100 },
];

export function CustomerCreditGraphAnalysis({ customerId }: CustomerCreditGraphAnalysisProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner / Headline */}
      <Card className="border-primary/20 bg-linear-to-r from-primary/10 via-background to-background">
        <CardContent className="p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/15 text-primary">
              <BrainCircuit className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Resultado de Evaluación de Crédito</h2>
                <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                  Score: 780 / 900
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Generado por CreditGraph Engine • ID de Análisis: #CG-{customerId}-2026
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Dictamen Automático</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">APROBACIÓN SUGERIDA</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid layout for radar chart and metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Radar Chart Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Perfil Radar de Riesgo Crediticio</CardTitle>
            </div>
            <CardDescription>
              Dimensiones clave evaluadas por el motor de grafos
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockRadarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Cliente"
                  dataKey="A"
                  stroke="#2563eb"
                  fill="#3b82f6"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Financial Capacity Breakdown */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Análisis de Capacidad de Pago</CardTitle>
              </div>
              <CardDescription>
                Cálculo de margen disponible mensual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ingreso Neto Declarado</span>
                  <span className="font-semibold">RD$ 85,000</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gastos Estimados & Deudas</span>
                  <span className="font-semibold text-amber-600">RD$ 40,000 (47%)</span>
                </div>
                <Progress value={47} className="h-2 bg-amber-100 dark:bg-amber-950/50" indicatorClassName="bg-amber-500" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Margen Libre Disponible</span>
                  <span className="font-bold text-emerald-600">RD$ 45,000 (53%)</span>
                </div>
                <Progress value={53} className="h-2 bg-emerald-100 dark:bg-emerald-950/50" indicatorClassName="bg-emerald-500" />
              </div>
            </CardContent>
          </div>

          <div className="p-6 pt-0">
            <div className="p-3 rounded-lg bg-muted/50 border text-xs text-muted-foreground">
              💡 <strong>Nota del Sistema:</strong> El margen libre permite absorber una cuota mensual estimada de hasta <strong>RD$ 22,500</strong> manteniendo una razón de cobertura holgada (2.0x).
            </div>
          </div>
        </Card>
      </div>

      {/* Explicabilidad IA & Factores de Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-base">Factores Favorables (Fortalezas)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Award className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">Antigüedad Laboral Sólida</span>
                  <p className="text-xs text-muted-foreground">Más de 3 años continuos en la misma empresa.</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">Sin Morosidades Recientes</span>
                  <p className="text-xs text-muted-foreground">Historial crediticio sin atrasos mayores a 30 días en los últimos 24 meses.</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-base">Observaciones & Mitigantes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">Relación Solicitud / Ingreso</span>
                  <p className="text-xs text-muted-foreground">Se recomienda verificar constancia de otros ingresos adicionales declarados.</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
