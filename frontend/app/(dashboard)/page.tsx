/**
 * Dashboard home page.
 * Displays a welcome card with quick stats placeholders.
 * Full data will be populated in Phases 5 & 6.
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
    color: "text-blue-500",
  },
  {
    title: "Loan Applications",
    value: "—",
    description: "All time",
    icon: FileText,
    color: "text-indigo-500",
  },
  {
    title: "Approved",
    value: "—",
    description: "This month",
    icon: CheckCircle,
    color: "text-green-500",
  },
  {
    title: "Pending Review",
    value: "—",
    description: "Awaiting action",
    icon: Clock,
    color: "text-amber-500",
  },
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back, {session.user?.name?.split(" ")[0] ?? "User"} 👋
        </h2>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your loan management system.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <CardDescription className="text-xs">
                {stat.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder for Phase 5 & 6 content */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
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
