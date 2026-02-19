"use client";

/**
 * CustomerListClient — client component that orchestrates the customer list.
 * Manages filter state, pagination, and delete confirmation lifecycle.
 */
import { useState } from "react";
import { CustomerFilters as CustomerFiltersBar } from "./CustomerFilters";
import { CustomerTable } from "./CustomerTable";
import { DeleteCustomerDialog } from "./DeleteCustomerDialog";
import { useCustomers } from "@/hooks/use-customers";
import type { CustomerFilters } from "@/lib/api/customers";

export function CustomerListClient() {
  const [filters, setFilters] = useState<CustomerFilters>({
    page: 1,
    per_page: 20,
  });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading } = useCustomers(filters);

  const handleFilterChange = (newFilters: CustomerFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div className="space-y-4">
      {/* Search & filter controls */}
      <CustomerFiltersBar filters={filters} onFilterChange={handleFilterChange} />

      {/* Data table */}
      <CustomerTable
        data={data}
        isLoading={isLoading}
        currentPage={filters.page ?? 1}
        onPageChange={handlePageChange}
        onDelete={(id) => setDeletingId(id)}
      />

      {/* Delete confirmation */}
      <DeleteCustomerDialog
        customerId={deletingId}
        onClose={() => setDeletingId(null)}
      />
    </div>
  );
}
