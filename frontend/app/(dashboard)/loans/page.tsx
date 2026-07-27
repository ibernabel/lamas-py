/**
 * Loan list page — /loans
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoanListClient } from "@/components/loans/LoanListClient";
import { ImportCsvModal } from "@/components/loans/ImportCsvModal";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Loan Applications</h1>
          <p className="text-muted-foreground text-sm">
            Monitor the workflow status of all credit requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ImportCsvModal />
          <Button asChild className="gap-2">
            <Link href="/loans/new" id="new-loan-btn">
              <Plus className="h-4 w-4" />
              New Application
            </Link>
          </Button>
        </div>
      </div>

      {/* Interactive list (client boundary) */}
      <LoanListClient />
    </div>
  );
}
