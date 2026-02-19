/**
 * New customer page — /customers/new
 * Server component shell; form is fully client-side.
 */
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CustomerForm } from "@/components/customers/CustomerForm";

export const metadata = {
  title: "New Customer — LAMaS",
};

export default async function NewCustomerPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/customers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Customers
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Customer</CardTitle>
          <CardDescription>
            Register a new customer. Fill in the tabs below — at least NID, full name, and one
            phone number are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
