"use client";

import { useState } from "react";
import { LoanFilters as LoanFiltersBar } from "./LoanFilters";
import { LoanTable } from "./LoanTable";
import { useLoanApplications, useDeleteLoan } from "@/hooks/use-loan-applications";
import type { LoanApplicationFilters } from "@/lib/api/loan-applications";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function LoanListClient() {
  const [filters, setFilters] = useState<LoanApplicationFilters>({
    page: 1,
    per_page: 20,
  });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading } = useLoanApplications(filters);
  const deleteMutation = useDeleteLoan();

  const handleFilterChange = (newFilters: LoanApplicationFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId, {
        onSuccess: () => setDeletingId(null),
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & filter controls */}
      <LoanFiltersBar filters={filters} onFilterChange={handleFilterChange} />

      {/* Data table */}
      <LoanTable
        data={data}
        isLoading={isLoading}
        currentPage={filters.page ?? 1}
        onPageChange={handlePageChange}
        onDelete={(id) => setDeletingId(id)}
      />

      {/* Delete confirmation (reusing logic from Customers pattern) */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft-delete the loan application. This action can be undone by an administrator.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Removing..." : "Remove Application"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
