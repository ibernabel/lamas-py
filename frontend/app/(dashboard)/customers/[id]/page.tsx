"use client";

/**
 * Customer detail page — /customers/[id]
 * Client component to use useCustomer hook for data fetching.
 */
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  PencilLine,
  Phone,
  MapPin,
  User,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useCustomer } from "@/hooks/use-customers";

// ── Helper components ──────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value ?? "—"}</span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, j) => (
              <Skeleton key={j} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Page component ─────────────────────────────────────────────────────────

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const { data: customer, isLoading, isError } = useCustomer(id);

  if (isLoading) return <DetailSkeleton />;

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
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/customers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Customers
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
              <Badge variant={customer.is_active ? "default" : "secondary"}>
                {customer.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground font-mono">{customer.nid}</p>
          </div>
        </div>
        <Button asChild id="edit-customer-btn">
          <Link href={`/customers/${customer.id}/edit`}>
            <PencilLine className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      {/* Identity card */}
      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Identity</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <InfoRow label="NID" value={customer.nid} />
          <InfoRow label="Lead Channel" value={customer.lead_channel} />
          <InfoRow label="Referred" value={customer.is_referred ? "Yes" : "No"} />
          {customer.is_referred && (
            <InfoRow label="Referred By" value={customer.referred_by} />
          )}
          <InfoRow label="Assigned" value={customer.is_assigned ? "Yes" : "No"} />
        </CardContent>
      </Card>

      {/* Personal details */}
      {customer.detail && (
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <InfoRow label="First Name" value={customer.detail.first_name} />
            <InfoRow label="Last Name" value={customer.detail.last_name} />
            <InfoRow label="Email" value={customer.detail.email} />
            <InfoRow label="Birthday" value={customer.detail.birthday} />
            <InfoRow
              label="Gender"
              value={
                customer.detail.gender === "M"
                  ? "Male"
                  : customer.detail.gender === "F"
                  ? "Female"
                  : customer.detail.gender === "O"
                  ? "Other"
                  : null
              }
            />
            <InfoRow label="Marital Status" value={customer.detail.marital_status} />
          </CardContent>
        </Card>
      )}

      {/* Phones */}
      {customer.phones.length > 0 && (
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Phone Numbers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {customer.phones.map((phone) => (
              <div key={phone.id} className="flex items-center gap-3">
                <span className="font-mono text-sm">{phone.number}</span>
                <Badge variant="outline" className="capitalize text-xs">
                  {phone.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Addresses */}
      {customer.addresses.length > 0 && (
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Addresses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer.addresses.map((addr, i) => (
              <div key={addr.id}>
                {i > 0 && <Separator className="mb-4" />}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <InfoRow label="Street" value={addr.street} />
                  <InfoRow label="City" value={addr.city} />
                  <InfoRow label="Province" value={addr.province} />
                  <InfoRow label="Postal Code" value={addr.postal_code} />
                  <InfoRow label="Country" value={addr.country} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <InfoRow label="Created" value={new Date(customer.created_at).toLocaleString()} />
            <InfoRow label="Last Updated" value={new Date(customer.updated_at).toLocaleString()} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
