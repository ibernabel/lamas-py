/**
 * Dashboard home page.
 * Displays welcome banner and KPI cards with SoliPres shadcn/ui styling.
 */
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, FileText, CheckCircle, Clock } from "lucide-react";

const stats = [
  {
    title: "Total Customers",
    value: "—",
    description: "Registered customers",
    icon: Users,
    color: "text-primary",
  },
  {
    title: "Loan Applications",
    value: "—",
    description: "All time",
    icon: FileText,
    color: "text-brand",
  },
  {
    title: "Approved",
    value: "—",
    description: "This month",
    icon: CheckCircle,
    color: "text-[var(--success-fg)]",
  },
  {
    title: "Pending Review",
    value: "—",
    description: "Awaiting action",
    icon: Clock,
    color: "text-[var(--warning-fg)]",
  },
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back, {session.user?.name?.split(" ")[0] ?? "User"} 👋
        </h2>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your SoluFime loan management system.
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
            Getting Started
          </CardTitle>
          <CardDescription>
            Navigate using the sidebar to manage customers and loan applications.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            📋 <strong>Customers</strong> — View, create, and manage customer profiles.
          </p>
          <p>
            📄 <strong>Loan Applications</strong> — Track applications through the approval workflow.
          </p>
          <p>
            🤖 <strong>Credit Analysis</strong> — CreditGraph AI integration coming in Phase 8.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
