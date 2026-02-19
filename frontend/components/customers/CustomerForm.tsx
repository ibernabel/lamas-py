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
import { CheckCircle2, XCircle, Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";

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
      referred_by: "",
      detail: {
        first_name: customer?.detail?.first_name ?? "",
        last_name: customer?.detail?.last_name ?? "",
        email: customer?.detail?.email ?? "",
        birthday: customer?.detail?.birthday ?? "",
        gender: customer?.detail?.gender ?? undefined,
        marital_status: (customer?.detail?.marital_status as CustomerFormValues["detail"]["marital_status"]) ?? undefined,
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
          onSuccess: (data) => router.push(`/customers/${data.id}`),
        }
      );
    } else if (customer) {
      updateMutation.mutate(
        {
          id: customer.id,
          payload: {
            lead_channel: values.lead_channel || undefined,
            is_referred: values.is_referred,
            detail: values.detail,
            phones: values.phones,
            addresses: values.addresses,
          },
        },
        { onSuccess: () => router.push(`/customers/${customer.id}`) }
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="identity" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="identity">Identity</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="phones">Phones</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
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
                  <FormLabel>Lead Channel</FormLabel>
                  <FormControl>
                    <Input id="lead-channel-input" placeholder="e.g. referral, social media…" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_referred"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Is Referred</FormLabel>
                  <Select
                    value={field.value ? "yes" : "no"}
                    onValueChange={(v) => field.onChange(v === "yes")}
                  >
                    <SelectTrigger id="is-referred-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                    <FormLabel>Birthday</FormLabel>
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
                    <FormLabel>Gender</FormLabel>
                    <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || undefined)}>
                      <SelectTrigger id="gender-select">
                        <SelectValue placeholder="Select…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Male</SelectItem>
                        <SelectItem value="F">Female</SelectItem>
                        <SelectItem value="O">Other</SelectItem>
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
                    <FormLabel>Marital Status</FormLabel>
                    <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || undefined)}>
                      <SelectTrigger id="marital-status-select">
                        <SelectValue placeholder="Select…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
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
              Add Address
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
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create Customer" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
