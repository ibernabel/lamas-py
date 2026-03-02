/**
 * Loan list page — /loans
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoanListClient } from "@/components/loans/LoanListClient";

export const metadata = {
  title: "Loan Applications — LAMaS",
  description: "Monitor and manage all loan applications.",
};

export default async function LoansPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Loan Applications</h1>
          <p className="text-muted-foreground text-sm">
            Monitor the workflow status of all credit requests.
          </p>
        </div>
        <Button asChild>
          <Link href="/loans/new" id="new-loan-btn">
            <Plus className="mr-2 h-4 w-4" />
            New Application
          </Link>
        </Button>
      </div>

      {/* Interactive list (client boundary) */}
      <LoanListClient />
    </div>
  );
}
