"use client";

/**
 * Customer edit page — /customers/[id]/edit with i18n support.
 */
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { useCustomer } from "@/hooks/use-customers";
import { useTranslation } from "@/lib/i18n/use-translation";

export default function EditCustomerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const { data: customer, isLoading, isError } = useCustomer(id);
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
        <p className="font-medium">{t("customers.notFound")}</p>
        <Button variant="ghost" size="sm" onClick={() => router.push("/customers")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("customers.backToCustomers")}
        </Button>
      </div>
    );
  }

  const fullName = customer.detail
    ? `${customer.detail.first_name} ${customer.detail.last_name}`
    : `${t("customers.title")} #${customer.id}`;

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/customers/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back")}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("customers.editCustomer")}</CardTitle>
          <CardDescription>
            {fullName} — {customer.nid}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerForm mode="edit" customer={customer} />
        </CardContent>
      </Card>
    </div>
  );
}
