"use client";

/**
 * Customer edit page — /customers/[id]/edit
 * Fetches existing customer and renders CustomerForm in edit mode.
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

export default function EditCustomerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const { data: customer, isLoading, isError } = useCustomer(id);

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
        <p className="font-medium">Customer not found</p>
        <Button variant="ghost" size="sm" onClick={() => router.push("/customers")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Button>
      </div>
    );
  }

  const fullName = customer.detail
    ? `${customer.detail.first_name} ${customer.detail.last_name}`
    : `Customer #${customer.id}`;

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/customers/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Customer</CardTitle>
          <CardDescription>
            Updating profile for <strong>{fullName}</strong> — {customer.nid}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerForm mode="edit" customer={customer} />
        </CardContent>
      </Card>
    </div>
  );
}
