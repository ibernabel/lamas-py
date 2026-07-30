"use client";

/**
 * Customer list page — /customers with i18n support.
 */
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerListClient } from "@/components/customers/CustomerListClient";
import { useTranslation } from "@/lib/i18n/use-translation";

export default function CustomersPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("customers.title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("customers.subtitle")}
          </p>
        </div>
        <Button asChild>
          <Link href="/customers/new" id="new-customer-btn">
            <Plus className="mr-2 h-4 w-4" />
            {t("customers.newCustomer")}
          </Link>
        </Button>
      </div>

      {/* Interactive list (client boundary) */}
      <CustomerListClient />
    </div>
  );
}
