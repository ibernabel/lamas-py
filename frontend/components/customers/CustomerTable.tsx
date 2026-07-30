"use client";

/**
 * CustomerTable — DataTable for the customer list with i18n support.
 * Displays paginated rows with action menu per row.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  FilePenLine,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CustomerStatusBadge } from "./CustomerStatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { CustomerListItem, PaginatedResponse } from "@/lib/api/types";
import { useTranslation } from "@/lib/i18n/use-translation";

interface CustomerTableProps {
  data: PaginatedResponse<CustomerListItem> | undefined;
  isLoading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  onDelete: (id: number) => void;
}

/** Format an ISO date string as a short human-readable date */
function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === "es" ? "es-DO" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Extract initials from a full name for the avatar */
function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function CustomerTable({
  data,
  isLoading,
  currentPage,
  onPageChange,
}: CustomerTableProps) {
  const router = useRouter();
  const { t, language } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground bg-card">
        <p className="text-sm font-medium">{t("customers.notFound")}</p>
        <p className="text-xs">{t("common.noData")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/80 shadow-2xs bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32.5">{t("customers.fields.nid")}</TableHead>
              <TableHead>{t("customers.fields.fullName")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("customers.fields.email")}</TableHead>
              <TableHead className="w-28">{t("common.status")}</TableHead>
              <TableHead className="hidden lg:table-cell w-32">{t("common.created")}</TableHead>
              <TableHead className="text-right w-28 sm:w-36">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((customer) => (
              <TableRow
                key={customer.id}
                className="cursor-pointer hover:bg-muted/40"
                onClick={() => router.push(`/customers/${customer.id}`)}
              >
                {/* NID */}
                <TableCell
                  className="font-mono text-xs font-medium text-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link
                    href={`/customers/${customer.id}`}
                    className="hover:underline"
                  >
                    {customer.nid}
                  </Link>
                </TableCell>

                {/* Full Name + avatar */}
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-7 w-7 text-xs bg-muted">
                      <AvatarFallback>{getInitials(customer.full_name)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm text-foreground">{customer.full_name}</span>
                  </div>
                </TableCell>

                {/* Email */}
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {customer.email ?? "—"}
                </TableCell>

                {/* Status badge */}
                <TableCell>
                  <CustomerStatusBadge isActive={customer.is_active} />
                </TableCell>

                {/* Created date */}
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {formatDate(customer.created_at, language)}
                </TableCell>

                {/* Actions: Grouped Ver|Editar buttons */}
                <TableCell onClick={(e) => e.stopPropagation()} className="text-right">
                  <div className="inline-flex items-center justify-end rounded-full border border-slate-200 dark:border-slate-700 bg-card px-3 py-1 shadow-2xs gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-xs font-semibold gap-1.5 text-[#0284c7] dark:text-[#38bdf8] hover:bg-transparent hover:text-[#0369a1] transition-colors"
                      asChild
                      title={t("common.view")}
                    >
                      <Link href={`/customers/${customer.id}`} aria-label={t("common.viewDetails")}>
                        <Eye className="h-3.5 w-3.5 text-[#0284c7] dark:text-[#38bdf8]" />
                        <span>{t("common.view")}</span>
                      </Link>
                    </Button>
                    <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-700 shrink-0" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-xs font-semibold gap-1.5 text-slate-800 dark:text-slate-100 hover:bg-transparent hover:text-primary transition-colors"
                      asChild
                      title={t("common.edit")}
                    >
                      <Link href={`/customers/${customer.id}/edit`} aria-label={t("common.edit")}>
                        <FilePenLine className="h-3.5 w-3.5 text-slate-700 dark:text-slate-200" />
                        <span>{t("common.edit")}</span>
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            {t("common.view")} {(currentPage - 1) * data.per_page + 1}–
            {Math.min(currentPage * data.per_page, data.total)} / {data.total}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              aria-label={t("common.previous")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={currentPage >= data.pages}
              onClick={() => onPageChange(currentPage + 1)}
              aria-label={t("common.next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
