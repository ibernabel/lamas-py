"use client";

/**
 * LoanTable — DataTable for the loan application list.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Eye,
  Trash2,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LoanStatusBadge } from "./LoanStatusBadge";
import type { LoanApplicationListItem, PaginatedResponse } from "@/lib/api/types";

interface LoanTableProps {
  data: PaginatedResponse<LoanApplicationListItem> | undefined;
  isLoading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  onDelete: (id: number) => void;
}

/** Format currency */
function formatCurrency(amount: number | null): string {
  if (amount === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/** Format date */
function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
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
  onDelete,
}: LoanTableProps) {
  const router = useRouter();

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
      <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-muted-foreground">
        <ClipboardList className="h-8 w-8 opacity-20" />
        <p className="text-sm font-medium">No loan applications found</p>
        <p className="text-xs">Try adjusting your filters or create a new application.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="hidden lg:table-cell w-32">Created</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((loan) => (
              <TableRow
                key={loan.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/loans/${loan.id}`)}
              >
                {/* ID */}
                <TableCell className="font-mono text-xs text-muted-foreground">
                  #{loan.id}
                </TableCell>

                {/* Customer Info */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7 text-[10px]">
                      <AvatarFallback>{getInitials(loan.customer_name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {loan.customer_name ?? "Unknown Customer"}
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
                <TableCell className="font-medium">
                  {formatCurrency(loan.amount)}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <LoanStatusBadge status={loan.status} />
                </TableCell>

                {/* Date */}
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {formatDate(loan.created_at)}
                </TableCell>

                {/* Actions */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label="Loan actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/loans/${loan.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(loan.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
            Showing {(currentPage - 1) * data.per_page + 1}–
            {Math.min(currentPage * data.per_page, data.total)} of {data.total} loans
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={currentPage >= data.pages}
              onClick={() => onPageChange(currentPage + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
