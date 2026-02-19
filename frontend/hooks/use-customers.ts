/**
 * TanStack Query hooks for the Customers domain.
 * All mutations invalidate the customer list cache on success.
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { customersApi, type CustomerFilters } from "@/lib/api/customers";
import type { CustomerCreatePayload, CustomerUpdatePayload } from "@/lib/api/types";

/** Query key factory — keeps cache keys consistent */
export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (filters: CustomerFilters) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: number) => [...customerKeys.details(), id] as const,
};

// ============================================================================
// Queries
// ============================================================================

/** Paginated customer list with optional filters */
export function useCustomers(filters: CustomerFilters = {}) {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: () => customersApi.list(filters),
    placeholderData: (prev) => prev, // keep previous page visible while loading
  });
}

/** Single customer by ID (full detail with relations) */
export function useCustomer(id: number) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customersApi.getById(id),
    enabled: !!id,
  });
}

// ============================================================================
// Mutations
// ============================================================================

/** Create a new customer — shows success/error toast */
export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomerCreatePayload) => customersApi.create(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: customerKeys.lists() });
      toast.success(`Customer ${data.detail?.first_name ?? ""} created successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create customer: ${error.message}`);
    },
  });
}

/** Update an existing customer by ID */
export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CustomerUpdatePayload }) =>
      customersApi.update(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: customerKeys.lists() });
      qc.invalidateQueries({ queryKey: customerKeys.detail(data.id) });
      toast.success("Customer updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update customer: ${error.message}`);
    },
  });
}

/** Soft-delete a customer by ID */
export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => customersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.lists() });
      toast.success("Customer removed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete customer: ${error.message}`);
    },
  });
}
