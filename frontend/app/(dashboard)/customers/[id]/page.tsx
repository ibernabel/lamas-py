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
  MapPin,
  User,
  CalendarDays,
  Briefcase,
  Users,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentsSection } from "@/components/documents/DocumentsSection";
import { CustomerLoansTable } from "@/components/loans/CustomerLoansTable";
import { useCustomer } from "@/hooks/use-customers";

// ── Helper components ──────────────────────────────────────────────────────

function InfoRow({ label, value, className }: { label: string; value: string | React.ReactNode | null | undefined; className?: string }) {
  return (
    <div className={`flex items-start py-2 border-b border-muted/30 last:border-0 ${className}`}>
      <span className="text-sm text-muted-foreground w-1/3 min-w-30 pt-0.5">{label}</span>
      <div className="text-sm font-medium flex-1">{value ?? "—"}</div>
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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-11 bg-transparent p-0">
          <TabsTrigger 
            value="overview" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-11 px-6"
          >
            Resumen
          </TabsTrigger>
          <TabsTrigger 
            value="documents" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-11 px-6"
          >
            Documentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-6">
          {/* Identity & Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Información del Socio</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-0">
                <InfoRow label="Nombre" value={`${customer.detail?.first_name ?? ""} ${customer.detail?.last_name ?? ""}`} />
                <InfoRow label="Cédula" value={customer.nid} />
                <InfoRow label="Fecha de Nacimiento" value={customer.detail?.birthday} />
                <InfoRow 
                  label="Celular" 
                  value={customer.phones.find(p => p.type === "mobile")?.number} 
                />
                <InfoRow 
                  label="Teléfono Casa" 
                  value={customer.phones.find(p => p.type === "home")?.number} 
                />
                <InfoRow label="Email" value={customer.detail?.email} />
                <InfoRow label="Estado Civil" value={customer.detail?.marital_status} className="capitalize" />
                <InfoRow label="Nacionalidad" value={customer.detail?.nationality} />
                <InfoRow 
                  label="Género"
                  value={
                    customer.detail?.gender === "M"
                      ? "Masculino"
                      : customer.detail?.gender === "F"
                      ? "Femenino"
                      : customer.detail?.gender === "O"
                      ? "Otro"
                      : null
                  }
                />
                <InfoRow label="Educación" value={customer.detail?.education_level} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Vivienda y Ubicación</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-0">
                <InfoRow 
                  label="Dirección" 
                  value={customer.addresses[0] ? (
                    <div>
                      {customer.addresses[0].street}
                      <br />
                      {customer.addresses[0].city}, {customer.addresses[0].province}
                    </div>
                  ) : null} 
                />
                <InfoRow label="Tipo de vivienda" value={customer.detail?.housing_type} />
                <InfoRow label="Posesión" value={customer.detail?.housing_possession_type} />
                <InfoRow label="Reside desde" value={customer.detail?.move_in_date} />
                <InfoRow label="Medio de transporte" value={customer.detail?.mode_of_transport} />
                
                <Separator className="my-4" />
                
                <InfoRow label="Canal de Captación" value={customer.lead_channel} />
                <InfoRow label="Referido" value={customer.is_referred ? "Sí" : "No"} />
                {customer.is_referred && (
                  <InfoRow label="Referido Por" value={customer.referred_by} />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Laboral Info */}
          <Card>
            <CardHeader className="pb-3 text-right">
              <div className="flex items-center gap-2 justify-end">
                <CardTitle className="text-base">Información Laboral</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-0">
              <InfoRow label="Trabajador Independiente" value={customer.job_info?.is_self_employed ? "Sí" : "No"} />
              <InfoRow label="Empresa" value={customer.company?.name} />
              <InfoRow 
                label="Dirección Empresa" 
                value={customer.company?.department || customer.company?.branch ? `${customer.company.department ?? ""} ${customer.company.branch ?? ""}` : null} 
              />
              <InfoRow label="Teléfono" value={customer.company?.email} /> {/* Note: Backend Company model has email but maybe no phone? Using email as placeholder if so, or check if phones relationship applies to company */}
              <InfoRow label="Cargo" value={customer.job_info?.role} />
              <InfoRow label="Fecha de Ingreso" value={customer.job_info?.start_date} />
              <InfoRow label="Salario" value={customer.job_info?.salary ? `RD$ ${customer.job_info.salary.toLocaleString()}` : null} />
              <InfoRow label="Tipo de Pago" value={customer.job_info?.payment_type} />
              <InfoRow label="Frecuencia de Pago" value={customer.job_info?.payment_frequency} />
              <InfoRow label="Banco Nomina" value={customer.job_info?.payment_bank} />
              <InfoRow label="Otros Ingresos" value={customer.job_info?.other_incomes} />
              <InfoRow label="Fuente Otros Ingresos" value={customer.job_info?.other_incomes_source} />
              <InfoRow label="Horario" value={customer.job_info?.schedule} />
              <InfoRow label="Supervisor" value={customer.job_info?.supervisor_name} />
            </CardContent>
          </Card>

          {/* References & Vehicle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3 text-right">
                <div className="flex items-center gap-2 justify-end">
                  <CardTitle className="text-base">Referencias</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {customer.references && customer.references.length > 0 ? (
                  customer.references.map((ref, index) => (
                    <div key={ref.id} className="space-y-0">
                      <div className="text-sm font-semibold text-muted-foreground mb-2">Referencia {index + 1}</div>
                      <InfoRow label="Nombre" value={ref.name} />
                      <InfoRow label="Ocupación" value={ref.occupation} />
                      <InfoRow label="Relación" value={ref.relationship} />
                      <InfoRow label="Teléfono" value={ref.nid ? "Consultar NID" : null} /> {/* Placeholder for phone logic */}
                      <InfoRow label="Tipo" value={ref.type} />
                      {index < customer.references.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic py-4">No hay referencias registradas.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 text-right">
                <div className="flex items-center gap-2 justify-end">
                  <CardTitle className="text-base">Información de Vehículo</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-0">
                <InfoRow label="Tipo" value={customer.vehicle?.vehicle_type} />
                <InfoRow label="Marca" value={customer.vehicle?.vehicle_brand} />
                <InfoRow label="Modelo" value={customer.vehicle?.vehicle_model} />
                <InfoRow label="Año" value={customer.vehicle?.vehicle_year} />
                <InfoRow label="Color" value={customer.vehicle?.vehicle_color} />
                <InfoRow label="Placa" value={customer.vehicle?.vehicle_plate_number} />
                <InfoRow label="Estado" value={
                  customer.vehicle?.is_owned ? "Propio" : 
                  customer.vehicle?.is_financed ? "Financiado" : 
                  customer.vehicle?.is_leased ? "Leasing" : null
                } />
              </CardContent>
            </Card>
          </div>

          {/* Metadata */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <InfoRow label="Created" value={new Date(customer.created_at).toLocaleString()} />
                <InfoRow label="Last Updated" value={new Date(customer.updated_at).toLocaleString()} />
              </div>
            </CardContent>
          </Card>

          {/* Customer Loan Applications */}
          <CustomerLoansTable customerId={customer.id} />
        </TabsContent>

        <TabsContent value="documents" className="pt-6">
          <DocumentsSection 
            entityType="customer" 
            entityId={customer.id} 
            requiredTypes={[
              { type: "nid", label: "Cédula de Identidad (NID)" },
              { type: "labor_letter", label: "Carta de Trabajo Reciente" }
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
