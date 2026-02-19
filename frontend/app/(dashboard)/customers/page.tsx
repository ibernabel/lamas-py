/**
 * Customer list page — /customers
 * Server component: provides auth guard and static header.
 * CustomerListClient handles interactive data fetching.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerListClient } from "@/components/customers/CustomerListClient";

export const metadata = {
  title: "Customers — LAMaS",
  description: "Manage customer profiles and loan applications.",
};

export default async function CustomersPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground text-sm">
            View, search, and manage all registered customers.
          </p>
        </div>
        <Button asChild>
          <Link href="/customers/new" id="new-customer-btn">
            <Plus className="mr-2 h-4 w-4" />
            New Customer
          </Link>
        </Button>
      </div>

      {/* Interactive list (client boundary) */}
      <CustomerListClient />
    </div>
  );
}
