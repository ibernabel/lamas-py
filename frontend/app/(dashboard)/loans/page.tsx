"use client";

/**
 * Loan list page — /loans with i18n support.
 */
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoanListClient } from "@/components/loans/LoanListClient";
import { ImportCsvModal } from "@/components/loans/ImportCsvModal";
import { useTranslation } from "@/lib/i18n/use-translation";

export default function LoansPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("loans.title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("loans.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ImportCsvModal />
          <Button asChild className="gap-2">
            <Link href="/loans/new" id="new-loan-btn">
              <Plus className="h-4 w-4" />
              {t("loans.newLoan")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Interactive list (client boundary) */}
      <LoanListClient />
    </div>
  );
}
