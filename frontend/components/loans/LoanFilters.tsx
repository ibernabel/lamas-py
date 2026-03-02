"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { LoanStatus } from "@/lib/api/types";
import type { LoanApplicationFilters } from "@/lib/api/loan-applications";

interface LoanFiltersProps {
  filters: LoanApplicationFilters;
  onFilterChange: (filters: LoanApplicationFilters) => void;
}

export function LoanFilters({
  filters,
  onFilterChange,
}: LoanFiltersProps) {
  const [search, setSearch] = useState(filters.customer_id?.toString() ?? "");

  // Debounce the customer ID search input (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      const customerId = parseInt(search);
      onFilterChange({
        ...filters,
        customer_id: !isNaN(customerId) ? customerId : undefined,
        page: 1,
      });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleStatusChange = useCallback(
    (value: string) => {
      onFilterChange({
        ...filters,
        status: value === "all" ? undefined : (value as LoanStatus),
        page: 1,
      });
    },
    [filters, onFilterChange]
  );

  const handleReset = () => {
    setSearch("");
    onFilterChange({ page: 1, per_page: filters.per_page });
  };

  const hasActiveFilters = !!search || filters.status !== undefined;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Customer ID Search */}
      <div className="relative flex-1 min-w-50">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="loan-search"
          placeholder="Search by customer ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status filter */}
      <Select
        value={filters.status ?? "all"}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger id="loan-status-filter" className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="received">Received</SelectItem>
          <SelectItem value="verified">Verified</SelectItem>
          <SelectItem value="assigned">Assigned</SelectItem>
          <SelectItem value="analyzed">Analyzed</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>

      {/* Reset button */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <X className="mr-1 h-4 w-4" />
          Reset
        </Button>
      )}
    </div>
  );
}
