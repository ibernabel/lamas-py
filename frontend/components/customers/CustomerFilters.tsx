"use client";

/**
 * CustomerFilters — search bar with debounced input and status filter and i18n support.
 * Controlled by the parent via onFilterChange callback.
 */
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
import type { CustomerFilters as CustomerFiltersType } from "@/lib/api/customers";
import { useTranslation } from "@/lib/i18n/use-translation";

interface CustomerFiltersProps {
  filters: CustomerFiltersType;
  onFilterChange: (filters: CustomerFiltersType) => void;
}

export function CustomerFilters({
  filters,
  onFilterChange,
}: CustomerFiltersProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState(filters.name ?? "");

  // Debounce the name/NID search input (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      const isNumeric = /^\d+$/.test(search);
      onFilterChange({
        ...filters,
        name: !isNumeric && search ? search : undefined,
        nid: isNumeric && search ? search : undefined,
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
        is_active: value === "all" ? undefined : value === "active",
        page: 1,
      });
    },
    [filters, onFilterChange]
  );

  const handleReset = () => {
    setSearch("");
    onFilterChange({ page: 1, per_page: filters.per_page });
  };

  const hasActiveFilters =
    !!search || filters.is_active !== undefined;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="customer-search"
          placeholder={t("customers.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status filter */}
      <Select
        value={
          filters.is_active === undefined
            ? "all"
            : filters.is_active
            ? "active"
            : "inactive"
        }
        onValueChange={handleStatusChange}
      >
        <SelectTrigger id="customer-status-filter" className="w-[140px]">
          <SelectValue placeholder={t("common.status")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("common.all")}</SelectItem>
          <SelectItem value="active">{t("status.active")}</SelectItem>
          <SelectItem value="inactive">{t("status.inactive")}</SelectItem>
        </SelectContent>
      </Select>

      {/* Reset button — only visible when filters are applied */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <X className="mr-1 h-4 w-4" />
          {t("common.cancel")}
        </Button>
      )}
    </div>
  );
}
