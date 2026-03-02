/**
 * New Loan Application page — /loans/new
 */
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoanForm } from "@/components/loans/LoanForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "New Application — LAMaS",
};

export default async function NewLoanPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/loans"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Loans
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">New Loan Application</h1>
        <p className="text-muted-foreground text-sm">
          Register a new credit request for an existing customer.
        </p>
      </div>

      <LoanForm />
    </div>
  );
}
