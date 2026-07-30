"use client";

/**
 * LoanTable — DataTable for the loan application list with i18n support.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LoanStatusBadge } from "./LoanStatusBadge";
import type { LoanApplicationListItem, PaginatedResponse } from "@/lib/api/types";
import { useTranslation } from "@/lib/i18n/use-translation";

interface LoanTableProps {
  data: PaginatedResponse<LoanApplicationListItem> | undefined;
  isLoading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  onDelete: (id: number) => void;
}

/** Format currency DOP */
function formatCurrency(amount: number | null, locale: string): string {
  if (amount === null) return "—";
  return new Intl.NumberFormat(locale === "es" ? "es-DO" : "en-US", {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format date */
function formatDate(iso: string | null, locale: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(locale === "es" ? "es-DO" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Get initials for avatar */
function getInitials(name?: string): string {
  if (!name) return "??";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function LoanTable({
  data,
  isLoading,
  currentPage,
  onPageChange,
}: LoanTableProps) {
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
        <ClipboardList className="h-8 w-8 opacity-20" />
        <p className="text-sm font-medium">{t("common.noData")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/80 shadow-2xs bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>{t("customers.title")}</TableHead>
              <TableHead>{t("loans.amount")}</TableHead>
              <TableHead className="w-32">{t("common.status")}</TableHead>
              <TableHead className="hidden lg:table-cell w-32">{t("common.created")}</TableHead>
              <TableHead className="w-24 sm:w-28 text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((loan) => (
              <TableRow
                key={loan.id}
                className="cursor-pointer hover:bg-muted/40"
                onClick={() => router.push(`/loans/${loan.id}`)}
              >
                {/* ID */}
                <TableCell className="font-mono text-xs font-medium text-muted-foreground">
                  #{loan.id}
                </TableCell>

                {/* Customer Info */}
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-7 w-7 text-[10px] bg-muted">
                      <AvatarFallback>{getInitials(loan.customer_name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-foreground">
                        {loan.customer_name ?? t("common.noData")}
                      </span>
                      {loan.customer_nid && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {loan.customer_nid}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Amount */}
                <TableCell className="font-medium text-foreground">
                  {formatCurrency(loan.amount, language)}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <LoanStatusBadge status={loan.status} />
                </TableCell>

                {/* Date */}
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {formatDate(loan.created_at, language)}
                </TableCell>

                {/* Actions */}
                <TableCell onClick={(e) => e.stopPropagation()} className="text-right">
                  <div className="inline-flex items-center justify-end rounded-full border border-slate-200 dark:border-slate-700 bg-card px-3 py-1 shadow-2xs">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-xs font-semibold gap-1.5 text-[#0284c7] dark:text-[#38bdf8] hover:bg-transparent hover:text-[#0369a1] transition-colors"
                      asChild
                      title={t("common.view")}
                    >
                      <Link href={`/loans/${loan.id}`} aria-label={t("common.viewDetails")}>
                        <Eye className="h-3.5 w-3.5 text-[#0284c7] dark:text-[#38bdf8]" />
                        <span>{t("common.view")}</span>
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
