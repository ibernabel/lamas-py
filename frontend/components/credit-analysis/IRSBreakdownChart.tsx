"use client";

import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { CreditGraphAnalysisRead } from "@/lib/api/types";

interface IRSBreakdownChartProps {
  analysis: CreditGraphAnalysisRead;
}

export function IRSBreakdownChart({ analysis }: IRSBreakdownChartProps) {
  // Extract IRS dimensions from full_response
  // Format: { irs1: 90, irs2: 85, ... }
  const irsData = analysis.full_response.irs_breakdown || {
    irs1: analysis.full_response.irs1 || 0,
    irs2: analysis.full_response.irs2 || 0,
    irs3: analysis.full_response.irs3 || 0,
    irs4: analysis.full_response.irs4 || 0,
    irs5: analysis.full_response.irs5 || 0,
  };

  const data = [
    { subject: 'Financial Health', A: irsData.irs1, fullMark: 100 },
    { subject: 'Payment Behavior', A: irsData.irs2, fullMark: 100 },
    { subject: 'Digital Footprint', A: irsData.irs3, fullMark: 100 },
    { subject: 'Socio-Demographic', A: irsData.irs4, fullMark: 100 },
    { subject: 'Stability Signals', A: irsData.irs5, fullMark: 100 },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>IRS Breakdown</CardTitle>
        <CardDescription>Multi-dimensional risk scoring analysis (0-100Scale)</CardDescription>
      </CardHeader>
      <CardContent className="h-75 w-full pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: '#94a3b8', fontSize: 8 }}
            />
            <Radar
              name="Score"
              dataKey="A"
              stroke="#0f172a"
              fill="#0f172a"
              fillOpacity={0.3}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
