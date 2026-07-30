"use client";

/**
 * Customer detail page — /customers/[id]
 * Client component to use useCustomer hook for data fetching.
 */
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  PencilLine,
  MapPin,
  User,
  Briefcase,
  Users,
  Car,
  BrainCircuit,
  FileText,
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
import { CreditGraphSummaryCard } from "@/components/customers/CreditGraphSummaryCard";
import { CustomerCreditGraphAnalysis } from "@/components/customers/CustomerCreditGraphAnalysis";
import { CustomerLegacyView } from "@/components/customers/CustomerLegacyView";
import { CustomerStatusBadge } from "@/components/customers/CustomerStatusBadge";
import { useCustomer } from "@/hooks/use-customers";
import { useTranslation } from "@/lib/i18n/use-translation";

// ── Helper components ──────────────────────────────────────────────────────

function InfoRow({ label, value, className }: { label: string; value: string | React.ReactNode | null | undefined; className?: string }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 border-b border-muted/30 last:border-0 ${className ?? ""}`}>
      <span className="text-sm text-muted-foreground font-medium pt-0.5">{label}</span>
      <div className="text-sm font-semibold sm:col-span-2 text-foreground">{value ?? "—"}</div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-32" />
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-[400px] w-full rounded-xl" />
    </div>
  );
}

// ── Page component ─────────────────────────────────────────────────────────

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = Number(params.id);
  const { data: customer, isLoading, isError } = useCustomer(id);
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["overview", "documents", "analysis", "legacy"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  if (isLoading) return <DetailSkeleton />;

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
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/customers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("nav.customers")}
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
              <CustomerStatusBadge isActive={customer.is_active} />
            </div>
            <p className="text-sm text-muted-foreground font-mono">{t("customers.fields.nid")}: {customer.nid}</p>
          </div>
        </div>
        <Button asChild id="edit-customer-btn">
          <Link href={`/customers/${customer.id}/edit`}>
            <PencilLine className="mr-2 h-4 w-4" />
            {t("customers.editCustomer")}
          </Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-11 bg-transparent p-0 gap-2 flex-wrap">
          <TabsTrigger 
            value="overview" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-11 px-4 font-medium"
          >
            Resumen
          </TabsTrigger>
          <TabsTrigger 
            value="documents" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-11 px-4 font-medium"
          >
            Documentos
          </TabsTrigger>
          <TabsTrigger 
            value="analysis" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-11 px-4 font-medium flex items-center gap-1.5"
          >
            <BrainCircuit className="h-4 w-4 text-primary" />
            Análisis CreditGraph
          </TabsTrigger>
          <TabsTrigger 
            value="legacy" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-11 px-4 font-medium flex items-center gap-1.5"
          >
            <FileText className="h-4 w-4 text-muted-foreground" />
            Legacy (SoliPres)
          </TabsTrigger>
        </TabsList>

        {/* ── Overview Tab (Resumen) ─────────────────────────────────────── */}
        <TabsContent value="overview" className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left/Center Column: Stacked Cards (Single Column) */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Información del Socio */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Información del Socio</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-0">
                  <InfoRow label="Nombre Completo" value={`${customer.detail?.first_name ?? ""} ${customer.detail?.last_name ?? ""}`} />
                  <InfoRow label="Cédula de Identidad" value={customer.nid} />
                  <InfoRow label="Fecha de Nacimiento" value={customer.detail?.birthday} />
                  <InfoRow 
                    label="Celular" 
                    value={customer.phones.find(p => p.type === "mobile")?.number} 
                  />
                  <InfoRow 
                    label="Teléfono Residencia" 
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
                  <InfoRow label="Nivel Educativo" value={customer.detail?.education_level} />
                </CardContent>
              </Card>

              {/* 2. Vivienda y Ubicación */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Vivienda y Ubicación</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-0">
                  <InfoRow 
                    label="Dirección Residencia" 
                    value={customer.addresses[0] ? (
                      <div>
                        {customer.addresses[0].street}
                        <br />
                        {customer.addresses[0].city}, {customer.addresses[0].province}
                      </div>
                    ) : null} 
                  />
                  <InfoRow label="Tipo de Vivienda" value={customer.detail?.housing_type} />
                  <InfoRow label="Condición de Posesión" value={customer.detail?.housing_possession_type} />
                  <InfoRow label="Reside Desde" value={customer.detail?.move_in_date} />
                  <InfoRow label="Medio de Transporte" value={customer.detail?.mode_of_transport} />
                  
                  <Separator className="my-4" />
                  
                  <InfoRow label="Canal de Captación" value={customer.lead_channel} />
                  <InfoRow label="Es Referido" value={customer.is_referred ? "Sí" : "No"} />
                  {customer.is_referred && (
                    <InfoRow label="Referido Por" value={customer.referred_by} />
                  )}
                </CardContent>
              </Card>

              {/* 3. Información Laboral */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Información Laboral</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-0">
                  <InfoRow label="Trabajador Independiente" value={customer.job_info?.is_self_employed ? "Sí" : "No"} />
                  <InfoRow label="Empresa / Institución" value={customer.company?.name} />
                  <InfoRow 
                    label="Ubicación / Sucursal" 
                    value={customer.company?.department || customer.company?.branch ? `${customer.company.department ?? ""} ${customer.company.branch ?? ""}` : null} 
                  />
                  <InfoRow label="Teléfono / Email Trabajo" value={customer.company?.email} />
                  <InfoRow label="Cargo u Ocupación" value={customer.job_info?.role} />
                  <InfoRow label="Fecha de Ingreso" value={customer.job_info?.start_date} />
                  <InfoRow label="Salario Mensual" value={customer.job_info?.salary ? `RD$ ${customer.job_info.salary.toLocaleString()}` : null} />
                  <InfoRow label="Tipo de Pago" value={customer.job_info?.payment_type} />
                  <InfoRow label="Frecuencia de Pago" value={customer.job_info?.payment_frequency} />
                  <InfoRow label="Banco Nómina" value={customer.job_info?.payment_bank} />
                  <InfoRow label="Otros Ingresos" value={customer.job_info?.other_incomes} />
                  <InfoRow label="Fuente Otros Ingresos" value={customer.job_info?.other_incomes_source} />
                  <InfoRow label="Horario de Trabajo" value={customer.job_info?.schedule} />
                  <InfoRow label="Supervisor Inmediato" value={customer.job_info?.supervisor_name} />
                </CardContent>
              </Card>

              {/* 4. Referencias */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Referencias</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customer.references && customer.references.length > 0 ? (
                    customer.references.map((ref, index) => (
                      <div key={ref.id} className="space-y-0">
                        <div className="text-xs font-bold text-muted-foreground uppercase mb-2">
                          Referencia #{index + 1}
                        </div>
                        <InfoRow label="Nombre Completo" value={ref.name} />
                        <InfoRow label="Ocupación" value={ref.occupation} />
                        <InfoRow label="Relación / Parentesco" value={ref.relationship} />
                        <InfoRow label="Tipo de Referencia" value={ref.type} />
                        {index < customer.references.length - 1 && <Separator className="my-4" />}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic py-2">No hay referencias registradas.</p>
                  )}
                </CardContent>
              </Card>

              {/* 5. Información de Vehículo */}
              {customer.vehicle && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-primary" />
                      <CardTitle className="text-base">Información de Vehículo</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-0">
                    <InfoRow label="Tipo de Vehículo" value={customer.vehicle.vehicle_type} />
                    <InfoRow label="Marca" value={customer.vehicle.vehicle_brand} />
                    <InfoRow label="Modelo" value={customer.vehicle.vehicle_model} />
                    <InfoRow label="Año" value={customer.vehicle.vehicle_year} />
                    <InfoRow label="Color" value={customer.vehicle.vehicle_color} />
                    <InfoRow label="Placa" value={customer.vehicle.vehicle_plate_number} />
                    <InfoRow 
                      label="Condición" 
                      value={
                        customer.vehicle.is_owned ? "Propio" : 
                        customer.vehicle.is_financed ? "Financiado" : 
                        customer.vehicle.is_leased ? "Leasing" : null
                      } 
                    />
                  </CardContent>
                </Card>
              )}

              {/* 6. Metadata */}
              <Card className="bg-muted/10">
                <CardContent className="pt-4 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div><strong>Fecha de Registro:</strong> {new Date(customer.created_at).toLocaleString("es-DO")}</div>
                    <div><strong>Última Actualización:</strong> {new Date(customer.updated_at).toLocaleString("es-DO")}</div>
                  </div>
                </CardContent>
              </Card>

              {/* 7. Loan Applications / Table */}
              <CustomerLoansTable customerId={customer.id} />
            </div>

            {/* Right Column: CreditGraph AI Summary Sidebar */}
            <div className="lg:col-span-1 sticky top-6">
              <CreditGraphSummaryCard 
                onViewFullAnalysis={() => setActiveTab("analysis")}
              />
            </div>
          </div>
        </TabsContent>

        {/* ── Documents Tab ──────────────────────────────────────────────── */}
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

        {/* ── CreditGraph Analysis Tab ────────────────────────────────────── */}
        <TabsContent value="analysis" className="pt-6">
          <CustomerCreditGraphAnalysis customerId={customer.id} />
        </TabsContent>

        {/* ── Legacy SoliPres View Tab ────────────────────────────────────── */}
        <TabsContent value="legacy" className="pt-6">
          <CustomerLegacyView customer={customer} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
