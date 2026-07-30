"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, FileText, CheckCircle, Clock } from "lucide-react";

interface DashboardClientProps {
  userName: string;
}

export function DashboardClient({ userName }: DashboardClientProps) {
  const { t } = useTranslation();

  const stats = [
    {
      title: t("dashboard.totalCustomers"),
      value: "—",
      description: t("dashboard.registeredCustomers"),
      icon: Users,
      color: "text-primary",
    },
    {
      title: t("dashboard.loanApplications"),
      value: "—",
      description: t("dashboard.allTime"),
      icon: FileText,
      color: "text-brand",
    },
    {
      title: t("dashboard.approved"),
      value: "—",
      description: t("dashboard.thisMonth"),
      icon: CheckCircle,
      color: "text-[var(--success-fg)]",
    },
    {
      title: t("dashboard.pendingReview"),
      value: "—",
      description: t("dashboard.awaitingAction"),
      icon: Clock,
      color: "text-[var(--warning-fg)]",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {t("dashboard.welcome")} {userName.split(" ")[0]} 👋
        </h2>
        <p className="text-muted-foreground mt-1">
          {t("dashboard.subtitle")}
        </p>
      </div>

      {/* Stats grid with SoliPres KPI card styling */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.title} className="solipres-kpi-card">
            <div className="flex flex-row items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </span>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* System Overview Card */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            {t("dashboard.gettingStarted")}
          </CardTitle>
          <CardDescription>
            {t("dashboard.gettingStartedDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            📋 <strong>{t("nav.customers")}</strong> — {t("dashboard.navCustomersDesc")}
          </p>
          <p>
            📄 <strong>{t("nav.loanApplications")}</strong> — {t("dashboard.navLoansDesc")}
          </p>
          <p>
            🤖 <strong>{t("nav.creditAnalysis")}</strong> — {t("dashboard.navCreditGraphDesc")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
