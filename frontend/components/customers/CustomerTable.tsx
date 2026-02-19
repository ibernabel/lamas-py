"use client";

/**
 * CustomerTable — DataTable for the customer list.
 * Displays paginated rows with action menu per row.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Eye,
  PencilLine,
  Trash2,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { CustomerListItem, PaginatedResponse } from "@/lib/api/types";

interface CustomerTableProps {
  data: PaginatedResponse<CustomerListItem> | undefined;
  isLoading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  onDelete: (id: number) => void;
}

/** Format an ISO date string as a short human-readable date */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
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
  onDelete,
}: CustomerTableProps) {
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
        <p className="text-sm font-medium">No customers found</p>
        <p className="text-xs">Try adjusting your filters or create a new customer.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32.5">NID</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="w-25">Status</TableHead>
              <TableHead className="hidden lg:table-cell w-25">Assigned</TableHead>
              <TableHead className="hidden lg:table-cell w-30">Created</TableHead>
              <TableHead className="w-12.5" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((customer) => (
              <TableRow
                key={customer.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/customers/${customer.id}`)}
              >
                {/* NID */}
                <TableCell
                  className="font-mono text-xs"
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
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7 text-xs">
                      <AvatarFallback>{getInitials(customer.full_name)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{customer.full_name}</span>
                  </div>
                </TableCell>

                {/* Email */}
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {customer.email ?? "—"}
                </TableCell>

                {/* Status badge */}
                <TableCell>
                  <Badge variant={customer.is_active ? "default" : "secondary"}>
                    {customer.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>

                {/* Assigned */}
                <TableCell className="hidden lg:table-cell text-sm">
                  {customer.is_assigned ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )}
                </TableCell>

                {/* Created date */}
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {formatDate(customer.created_at)}
                </TableCell>

                {/* Action menu */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label="Customer actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/customers/${customer.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/customers/${customer.id}/edit`}>
                          <PencilLine className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(customer.id)}
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
            {Math.min(currentPage * data.per_page, data.total)} of {data.total} customers
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
