"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Customer } from "@/types/customer";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomerLegacyViewProps {
  customer: Customer;
}

function LegacyDetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-muted/40 text-xs">
      <span className="font-semibold text-muted-foreground">{label}:</span>
      <span className="col-span-2 font-medium text-foreground">{value ?? "—"}</span>
    </div>
  );
}

export function CustomerLegacyView({ customer }: CustomerLegacyViewProps) {
  const fullName = customer.detail
    ? `${customer.detail.first_name} ${customer.detail.last_name}`
    : `Cliente #${customer.id}`;

  const mobilePhone = customer.phones.find((p) => p.type === "mobile")?.number;
  const homePhone = customer.phones.find((p) => p.type === "home")?.number;
  const address = customer.addresses[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto bg-background p-4 rounded-lg border">
      {/* Top Banner / Actions */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wider text-muted-foreground">
            Expediente de Solicitud (SoliPres Legacy) #{customer.id}
          </h2>
          <p className="text-xs text-muted-foreground">
            Fecha de Registro: {new Date(customer.created_at).toLocaleDateString("es-DO")}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir Solicitud
        </Button>
      </div>

      {/* Section 1: Customer Information */}
      <Card className="shadow-none border border-border">
        <CardHeader className="py-3 bg-muted/30 border-b">
          <CardTitle className="text-sm font-bold uppercase text-primary">
            Información del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
          <LegacyDetailRow label="Nombre Completo" value={fullName} />
          <LegacyDetailRow label="Cédula de Identidad" value={customer.nid} />
          <LegacyDetailRow label="Fecha Nacimiento" value={customer.detail?.birthday} />
          <LegacyDetailRow label="Teléfono Celular" value={mobilePhone} />
          <LegacyDetailRow label="Teléfono Residencia" value={homePhone} />
          <LegacyDetailRow label="Correo Electrónico" value={customer.detail?.email} />
          <LegacyDetailRow label="Estado Civil" value={customer.detail?.marital_status} />
          <LegacyDetailRow label="Nacionalidad" value={customer.detail?.nationality} />
          <LegacyDetailRow
            label="Dirección"
            value={
              address ? `${address.street}, ${address.city}, ${address.province}` : null
            }
          />
          <LegacyDetailRow label="Tipo de Vivienda" value={customer.detail?.housing_possession_type} />
          <LegacyDetailRow label="Reside Desde" value={customer.detail?.move_in_date} />
          <LegacyDetailRow label="Medio de Transporte" value={customer.detail?.mode_of_transport} />
          <LegacyDetailRow label="Género" value={customer.detail?.gender} />
          <LegacyDetailRow label="Nivel de Educación" value={customer.detail?.education_level} />
        </CardContent>
      </Card>

      {/* Section 2: Employment Information */}
      <Card className="shadow-none border border-border">
        <CardHeader className="py-3 bg-muted/30 border-b">
          <CardTitle className="text-sm font-bold uppercase text-primary">
            Información Laboral
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
          <LegacyDetailRow label="Trabajador Independiente" value={customer.job_info?.is_self_employed ? "Sí" : "No"} />
          <LegacyDetailRow label="Empresa / Institución" value={customer.company?.name} />
          <LegacyDetailRow label="Cargo / Ocupación" value={customer.job_info?.role} />
          <LegacyDetailRow label="Fecha de Ingreso" value={customer.job_info?.start_date} />
          <LegacyDetailRow
            label="Salario Mensual"
            value={customer.job_info?.salary ? `RD$ ${customer.job_info.salary.toLocaleString()}` : null}
          />
          <LegacyDetailRow label="Frecuencia de Pago" value={customer.job_info?.payment_frequency} />
          <LegacyDetailRow label="Banco Nómina" value={customer.job_info?.payment_bank} />
          <LegacyDetailRow label="Otros Ingresos" value={customer.job_info?.other_incomes} />
          <LegacyDetailRow label="Fuente Otros Ingresos" value={customer.job_info?.other_incomes_source} />
          <LegacyDetailRow label="Supervisor Inmediato" value={customer.job_info?.supervisor_name} />
        </CardContent>
      </Card>

      {/* Section 3: References */}
      <Card className="shadow-none border border-border">
        <CardHeader className="py-3 bg-muted/30 border-b">
          <CardTitle className="text-sm font-bold uppercase text-primary">
            Referencias Personales y Familiares
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {customer.references && customer.references.length > 0 ? (
            <div className="space-y-4">
              {customer.references.map((ref, idx) => (
                <div key={ref.id} className="p-3 border rounded-md bg-muted/20">
                  <div className="text-xs font-bold text-muted-foreground mb-2">
                    Referencia #{idx + 1} ({ref.type})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                    <LegacyDetailRow label="Nombre" value={ref.name} />
                    <LegacyDetailRow label="Relación" value={ref.relationship} />
                    <LegacyDetailRow label="Ocupación" value={ref.occupation} />
                    <LegacyDetailRow label="Teléfono" value={ref.nid ? "Consultar NID" : "N/A"} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No hay referencias registradas en esta solicitud.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
