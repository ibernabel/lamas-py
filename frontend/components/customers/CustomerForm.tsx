"use client";

/**
 * CustomerForm — shared tabbed form for Create and Edit modes.
 *
 * Uses a single unified `customerFormSchema` for both modes so TypeScript
 * can infer a single `Control<CustomerFormValues>` type. The NID field is
 * rendered only in create mode; the submit handler sends the appropriate
 * payload based on the mode prop.
 *
 * Tabs:
 *   1. Identity — NID (create only), lead channel, is_referred
 *   2. Personal — first/last name, email, birthday, gender, marital status
 *   3. Phones   — dynamic list, at least 1 required
 *   4. Addresses — dynamic optional list
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, XCircle, Loader2, Plus, Trash2, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { DocumentsSection } from "@/components/documents/DocumentsSection";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  customerFormSchema,
  type CustomerFormValues,
} from "@/lib/validations/customer.schema";
import { customersApi } from "@/lib/api/customers";
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/use-customers";
import type { Customer } from "@/lib/api/types";

// ============================================================================
// Types
// ============================================================================

interface CustomerFormProps {
  mode: "create" | "edit";
  customer?: Customer; // provided in edit mode
}

type NidValidationState = "idle" | "loading" | "valid" | "invalid" | "taken";

// ============================================================================
// Component
// ============================================================================

export function CustomerForm({ mode, customer }: CustomerFormProps) {
  const router = useRouter();
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const [nidState, setNidState] = useState<NidValidationState>("idle");
  const [createdCustomerId, setCreatedCustomerId] = useState<number | null>(null);

  // ── Single unified form ────────────────────────────────────────────────────

  // Pinning all three generics ensures TTransformedValues === TFieldValues,
  // which is what zodResolver guarantees at runtime. This prevents the
  // Control type cascade introduced in react-hook-form v7.71.
  const form = useForm<CustomerFormValues, unknown, CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      NID: mode === "create" ? "" : undefined,
      lead_channel: customer?.lead_channel ?? "",
      is_referred: customer?.is_referred ?? false,
      referred_by: customer?.referred_by ?? "",
      detail: {
        first_name: customer?.detail?.first_name ?? "",
        last_name: customer?.detail?.last_name ?? "",
        email: customer?.detail?.email ?? "",
        nickname: customer?.detail?.nickname ?? "",
        birthday: customer?.detail?.birthday ?? "",
        gender: customer?.detail?.gender ?? undefined,
        marital_status: (customer?.detail?.marital_status as CustomerFormValues["detail"]["marital_status"]) ?? undefined,
        education_level: customer?.detail?.education_level ?? "",
        nationality: customer?.detail?.nationality ?? "",
        housing_type: customer?.detail?.housing_type ?? "",
        housing_possession_type: customer?.detail?.housing_possession_type ?? "",
        move_in_date: customer?.detail?.move_in_date ?? "",
        mode_of_transport: customer?.detail?.mode_of_transport ?? "",
      },
      phones: customer?.phones?.length
        ? customer.phones.map((p) => ({
            number: p.number,
            type: p.type as "mobile" | "home" | "work",
          }))
        : [{ number: "", type: "mobile" }],
      addresses: customer?.addresses?.map((a) => ({
        street: a.street,
        city: a.city,
        province: a.province,
        country: a.country ?? "Dominican Republic",
        postal_code: a.postal_code ?? undefined,
      })) ?? [],
      job_info: {
        role: customer?.job_info?.role ?? "",
        salary: customer?.job_info?.salary ?? 0,
        start_date: customer?.job_info?.start_date ?? "",
        payment_type: customer?.job_info?.payment_type ?? "",
        payment_frequency: customer?.job_info?.payment_frequency ?? "",
        payment_bank: customer?.job_info?.payment_bank ?? "",
        other_incomes: customer?.job_info?.other_incomes ?? 0,
        other_incomes_source: customer?.job_info?.other_incomes_source ?? "",
        schedule: customer?.job_info?.schedule ?? "",
        supervisor_name: customer?.job_info?.supervisor_name ?? "",
        is_self_employed: customer?.job_info?.is_self_employed ?? false,
      },
      company: {
        name: customer?.company?.name ?? "",
        industry: customer?.company?.industry ?? "",
        address: customer?.company?.address ?? "",
        phone: customer?.company?.phone ?? "",
      },
      vehicle: {
        vehicle_type: customer?.vehicle?.vehicle_type ?? "",
        vehicle_brand: customer?.vehicle?.vehicle_brand ?? "",
        vehicle_model: customer?.vehicle?.vehicle_model ?? "",
        vehicle_year: customer?.vehicle?.vehicle_year ?? 0,
        vehicle_color: customer?.vehicle?.vehicle_color ?? "",
        vehicle_plate_number: customer?.vehicle?.vehicle_plate_number ?? "",
        is_owned: customer?.vehicle?.is_owned ?? false,
        is_financed: customer?.vehicle?.is_financed ?? false,
        is_leased: customer?.vehicle?.is_leased ?? false,
      },
      references: customer?.references?.map((r) => ({
        id: r.id,
        name: r.name,
        nid: r.nid ?? "",
        email: r.email ?? "",
        relationship: r.relationship,
        reference_since: r.reference_since ?? "",
        occupation: r.occupation ?? "",
        is_who_referred: r.is_who_referred ?? false,
        type: r.type ?? "",
        address: r.address ?? "",
      })) ?? [],
    },
  });

  // ── Dynamic phone and address lists ────────────────────────────────────────

  const {
    fields: phoneFields,
    append: addPhone,
    remove: removePhone,
  } = useFieldArray({ control: form.control, name: "phones" });

  const {
    fields: addressFields,
    append: addAddress,
    remove: removeAddress,
  } = useFieldArray({ control: form.control, name: "addresses" });

  const {
    fields: referenceFields,
    append: addReference,
    remove: removeReference,
  } = useFieldArray({ control: form.control, name: "references" });

  // ── NID async validation ───────────────────────────────────────────────────

  const handleNidBlur = async (nid: string) => {
    if (!/^\d{11}$/.test(nid)) return; // Zod will catch the format
    setNidState("loading");
    try {
      const result = await customersApi.validateNid(nid);
      if (!result.is_valid) setNidState("invalid");
      else if (!result.is_unique) setNidState("taken");
      else setNidState("valid");
    } catch {
      setNidState("idle");
    }
  };

  const NidStatusIcon = () => {
    if (nidState === "loading") return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    if (nidState === "valid") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (nidState === "invalid" || nidState === "taken") return <XCircle className="h-4 w-4 text-destructive" />;
    return null;
  };

  // ── Submit handler ─────────────────────────────────────────────────────────

  const onSubmit = (values: CustomerFormValues) => {
    if (mode === "create") {
      // NID is required in create mode — validate presence before submitting
      if (!values.NID || !/^\d{11}$/.test(values.NID)) {
        form.setError("NID", { message: "National ID must be exactly 11 digits" });
        return;
      }

      createMutation.mutate(
        {
          NID: values.NID,
          detail: values.detail,
          phones: values.phones,
          addresses: values.addresses,
          lead_channel: values.lead_channel || undefined,
          is_referred: values.is_referred,
          referred_by: values.referred_by || undefined,
        },
        {
          onSuccess: (data) => {
            setCreatedCustomerId(data.id);
            toast.success("Cliente creado. Por favor, cargue los documentos obligatorios.");
          },
        }
      );
    } else if (customer) {
      updateMutation.mutate(
        {
          id: customer.id,
          payload: {
            lead_channel: values.lead_channel || undefined,
            is_referred: values.is_referred,
            referred_by: values.referred_by || undefined,
            detail: values.detail,
            phones: values.phones,
            addresses: values.addresses,
            job_info: values.job_info,
            company: values.company,
            vehicle: values.vehicle,
            references: values.references,
          },
        },
        { onSuccess: () => router.push(`/customers/${customer.id}`) }
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // ── Render ─────────────────────────────────────────────────────────────────

    if (createdCustomerId) {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex flex-col items-center text-center space-y-2">
            <div className="bg-green-100 p-3 rounded-full">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-green-900">¡Cliente Creado!</h2>
            <p className="text-green-700">
              El perfil de {form.getValues("detail.first_name")} ha sido registrado. 
              Ahora debe cargar los documentos requeridos para completar el expediente.
            </p>
          </div>

          <DocumentsSection 
            entityType="customer" 
            entityId={createdCustomerId}
            requiredTypes={[
              { type: "nid", label: "Cédula de Identidad (NID)" },
              { type: "labor_letter", label: "Carta de Trabajo Reciente" }
            ]}
          />

          <div className="flex justify-end pt-6 border-t">
            <Button onClick={() => router.push(`/customers/${createdCustomerId}`)}>
              Finalizar y ver perfil
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="identity" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="identity">Identidad</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="phones">Teléfonos</TabsTrigger>
            <TabsTrigger value="addresses">Dirección</TabsTrigger>
            <TabsTrigger value="laboral">Laboral</TabsTrigger>
            <TabsTrigger value="vehicle">Vehículo</TabsTrigger>
            <TabsTrigger value="references">Referencias</TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Identity ── */}
          <TabsContent value="identity" className="space-y-4 pt-4">
            {mode === "create" && (
              <FormField
                control={form.control}
                name="NID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>National ID (NID) *</FormLabel>
                    <div className="relative flex items-center">
                      <FormControl>
                        <Input
                          id="nid-input"
                          placeholder="00000000000"
                          maxLength={11}
                          className="font-mono pr-10"
                          {...field}
                          value={field.value ?? ""}
                          onBlur={(e) => {
                            field.onBlur();
                            handleNidBlur(e.target.value);
                          }}
                        />
                      </FormControl>
                      <span className="absolute right-3">
                        <NidStatusIcon />
                      </span>
                    </div>
                    {nidState === "taken" && (
                      <p className="text-xs text-destructive">This NID is already registered.</p>
                    )}
                    <FormDescription>11-digit Dominican Republic National ID</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="lead_channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Canal de Captación</FormLabel>
                  <FormControl>
                    <Input id="lead-channel-input" placeholder="Ej. referido, redes sociales…" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="detail.housing_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Vivienda</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Casa, Apartamento" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="detail.housing_possession_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posesión de Vivienda</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Propia, Alquilada" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_referred"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>¿Viene referido?</FormLabel>
                  </div>
                  <FormControl>
                    <Select
                      value={field.value ? "yes" : "no"}
                      onValueChange={(v) => field.onChange(v === "yes")}
                    >
                      <SelectTrigger id="is-referred-select" className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="yes">Sí</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("is_referred") && (
              <FormField
                control={form.control}
                name="referred_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cédula del Referidor</FormLabel>
                    <FormControl>
                      <Input placeholder="00000000000" maxLength={11} {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </TabsContent>

          {/* ── Tab 2: Personal ── */}
          <TabsContent value="personal" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="detail.first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input id="first-name-input" placeholder="Juan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="detail.last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input id="last-name-input" placeholder="Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="detail.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input id="email-input" type="email" placeholder="juan@example.com" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="detail.birthday"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Nacimiento</FormLabel>
                    <FormControl>
                      <Input id="birthday-input" type="date" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="detail.gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Género</FormLabel>
                    <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || undefined)}>
                      <SelectTrigger id="gender-select">
                        <SelectValue placeholder="Seleccionar…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Femenino</SelectItem>
                        <SelectItem value="O">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="detail.marital_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado Civil</FormLabel>
                    <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || undefined)}>
                      <SelectTrigger id="marital-status-select">
                        <SelectValue placeholder="Seleccionar…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Soltero/a</SelectItem>
                        <SelectItem value="married">Casado/a</SelectItem>
                        <SelectItem value="divorced">Divorciado/a</SelectItem>
                        <SelectItem value="widowed">Viudo/a</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="detail.nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apodo</FormLabel>
                    <FormControl>
                      <Input id="nickname-input" placeholder="Ej. El Rubio" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="detail.nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nacionalidad</FormLabel>
                    <FormControl>
                      <Input id="nationality-input" placeholder="Dominicana" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="detail.education_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel Educativo</FormLabel>
                    <FormControl>
                      <Input id="education-input" placeholder="Universitario, Bachiller..." {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="detail.mode_of_transport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medio de Transporte</FormLabel>
                    <FormControl>
                      <Input id="transport-input" placeholder="Vehículo propio, Público..." {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* ── Tab 3: Phones ── */}
          <TabsContent value="phones" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                At least one phone number is required.
              </p>
              <Badge variant="outline">{phoneFields.length} phone{phoneFields.length !== 1 ? "s" : ""}</Badge>
            </div>

            {phoneFields.map((phoneField, index) => (
              <div key={phoneField.id} className="rounded-md border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Phone {index + 1}</p>
                  {phoneFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removePhone(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`phones.${index}.number`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number *</FormLabel>
                        <FormControl>
                          <Input
                            id={`phone-number-${index}`}
                            placeholder="8091234567"
                            maxLength={10}
                            className="font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`phones.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id={`phone-type-${index}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mobile">Mobile</SelectItem>
                            <SelectItem value="home">Home</SelectItem>
                            <SelectItem value="work">Work</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addPhone({ number: "", type: "mobile" })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Phone
            </Button>
          </TabsContent>

          {/* ── Tab 4: Addresses ── */}
          <TabsContent value="addresses" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Addresses are optional in this phase.
              </p>
              <Badge variant="outline">{addressFields.length} address{addressFields.length !== 1 ? "es" : ""}</Badge>
            </div>

            {addressFields.map((addrField, index) => (
              <div key={addrField.id} className="rounded-md border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Address {index + 1}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => removeAddress(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name={`addresses.${index}.street`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street *</FormLabel>
                      <FormControl>
                        <Input id={`address-street-${index}`} placeholder="Calle Las Flores #12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name={`addresses.${index}.city`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input id={`address-city-${index}`} placeholder="Santo Domingo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`addresses.${index}.province`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Province *</FormLabel>
                        <FormControl>
                          <Input id={`address-province-${index}`} placeholder="Distrito Nacional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`addresses.${index}.postal_code`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input id={`address-postal-${index}`} placeholder="10000" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                addAddress({
                  street: "",
                  city: "",
                  province: "",
                  country: "Dominican Republic",
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Dirección
            </Button>
          </TabsContent>

          {/* ── Tab 5: Laboral ── */}
          <TabsContent value="laboral" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="job_info.is_self_employed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Trabajador Independiente</FormLabel>
                    </div>
                    <FormControl>
                      <Select
                        value={field.value ? "yes" : "no"}
                        onValueChange={(v) => field.onChange(v === "yes")}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="yes">Sí</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. ACME Corp" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="job_info.role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo / Ocupación</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Gerente de Ventas" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="job_info.salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salario Mensual</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value ?? 0} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="job_info.start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Ingreso</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="809-000-0000" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="job_info.payment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pago</FormLabel>
                    <FormControl>
                      <Input placeholder="Transferencia, Efectivo..." {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="job_info.payment_bank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banco de Nómina</FormLabel>
                    <FormControl>
                      <Input placeholder="Banreservas, Popular..." {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="job_info.supervisor_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Supervisor</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="job_info.schedule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horario Laboral</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. L-V 8:00 - 5:00" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="job_info.other_incomes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Otros Ingresos</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value ?? 0} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="job_info.other_incomes_source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuente de Otros Ingresos</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Ventas informales, Rentas..." {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* ── Tab 6: Vehicle ── */}
          <TabsContent value="vehicle" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="vehicle.vehicle_brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="Toyota, Honda..." {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicle.vehicle_model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="Camry, Civic..." {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="vehicle.vehicle_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="2020" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value ?? 0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicle.vehicle_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input placeholder="Blanco, Negro..." {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicle.vehicle_plate_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa</FormLabel>
                    <FormControl>
                      <Input placeholder="A000000" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="vehicle.is_owned"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <FormLabel>Propio</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ? "yes" : "no"}
                        onValueChange={(v) => field.onChange(v === "yes")}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="yes">Sí</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicle.is_financed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <FormLabel>Financiado</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ? "yes" : "no"}
                        onValueChange={(v) => field.onChange(v === "yes")}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="yes">Sí</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicle.is_leased"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <FormLabel>Leasing</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ? "yes" : "no"}
                        onValueChange={(v) => field.onChange(v === "yes")}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="yes">Sí</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* ── Tab 7: References ── */}
          <TabsContent value="references" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Agregue referencias personales o comerciales.
              </p>
              <Badge variant="outline">{referenceFields.length} referencia{referenceFields.length !== 1 ? "s" : ""}</Badge>
            </div>

            {referenceFields.map((refField, index) => (
              <div key={refField.id} className="rounded-md border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Referencia {index + 1}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => removeReference(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`references.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Juan Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`references.${index}.relationship`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relación *</FormLabel>
                        <FormControl>
                          <Input placeholder="Amigo, Familiar, Colega..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`references.${index}.occupation`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ocupación</FormLabel>
                        <FormControl>
                          <Input placeholder="Abogado, Comerciante..." {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`references.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar…" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="personal">Personal</SelectItem>
                            <SelectItem value="commercial">Comercial</SelectItem>
                            <SelectItem value="family">Familiar</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                addReference({
                  name: "",
                  relationship: "",
                  occupation: "",
                  is_who_referred: false,
                  type: "personal",
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Referencia
            </Button>
          </TabsContent>
        </Tabs>

        <Separator />

        {/* ── Footer actions ── */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Crear Cliente" : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
