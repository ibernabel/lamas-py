/**
 * Dashboard home page.
 * Displays welcome banner and KPI cards with SoliPres shadcn/ui styling and i18n support.
 */
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userName = session.user?.name ?? "User";

  return <DashboardClient userName={userName} />;
}
