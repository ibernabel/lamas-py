/**
 * TanStack Query hooks for the Loan Applications domain.
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { loanApplicationsApi, type LoanApplicationFilters } from "@/lib/api/loan-applications";
import type {
  LoanApplicationCreatePayload,
  LoanApplicationUpdatePayload,
  LoanStatus,
} from "@/lib/api/types";

/** Query key factory — keeps cache keys consistent */
export const loanKeys = {
  all: ["loan-applications"] as const,
  lists: () => [...loanKeys.all, "list"] as const,
  list: (filters: LoanApplicationFilters) => [...loanKeys.lists(), filters] as const,
  details: () => [...loanKeys.all, "detail"] as const,
  detail: (id: number) => [...loanKeys.details(), id] as const,
};

// ============================================================================
// Queries
// ============================================================================

/** Paginated loan application list with optional filters */
export function useLoanApplications(filters: LoanApplicationFilters = {}) {
  return useQuery({
    queryKey: loanKeys.list(filters),
    queryFn: () => loanApplicationsApi.list(filters),
    placeholderData: (prev) => prev,
  });
}

/** Single loan application by ID (full detail with relations) */
export function useLoanApplication(id: number) {
  return useQuery({
    queryKey: loanKeys.detail(id),
    queryFn: () => loanApplicationsApi.getById(id),
    enabled: !!id,
  });
}

// ============================================================================
// Mutations
// ============================================================================

/** Create a new loan application */
export function useCreateLoanApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoanApplicationCreatePayload) => loanApplicationsApi.create(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: loanKeys.lists() });
      toast.success(`Loan application #${data.id} created successfully`);
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      toast.error(`Failed to create loan application: ${error.response?.data?.detail || error.message}`);
    },
  });
}

/** Transition loan status */
export function useTransitionLoanStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: number; status: LoanStatus; note?: string }) =>
      loanApplicationsApi.transitionStatus(id, status, note),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: loanKeys.lists() });
      qc.invalidateQueries({ queryKey: loanKeys.detail(data.id) });
      toast.success(`Status updated to ${data.status}`);
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      toast.error(`Failed to update status: ${error.response?.data?.detail || error.message}`);
    },
  });
}

/** Add a note to a loan application */
export function useAddLoanNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) =>
      loanApplicationsApi.addNote(id, note),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: loanKeys.detail(data.id) });
      toast.success("Note added successfully");
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      toast.error(`Failed to add note: ${error.response?.data?.detail || error.message}`);
    },
  });
}

/** Trigger AI evaluation (placeholder) */
export function useEvaluateLoan() {
  return useMutation({
    mutationFn: (id: number) => loanApplicationsApi.evaluate(id),
    onSuccess: (data) => {
      toast.success(data.message || "Loan queued for AI evaluation");
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      toast.error(`Evaluation failed: ${error.response?.data?.detail || error.message}`);
    },
  });
}

/** Update loan details */
export function useUpdateLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: LoanApplicationUpdatePayload }) =>
      loanApplicationsApi.update(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: loanKeys.lists() });
      qc.invalidateQueries({ queryKey: loanKeys.detail(data.id) });
      toast.success("Loan application updated");
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      const message = error.response?.data?.detail || "Operation failed";
      toast.error(message);
    },
  });
}

/** Delete a loan application */
export function useDeleteLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => loanApplicationsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: loanKeys.lists() });
      toast.success("Loan application removed");
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      toast.error(`Failed to delete loan: ${error.response?.data?.detail || error.message}`);
    },
  });
}
