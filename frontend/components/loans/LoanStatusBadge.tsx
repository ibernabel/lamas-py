import { Badge } from "@/components/ui/badge";
import type { LoanStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface LoanStatusBadgeProps {
  status: LoanStatus;
  className?: string;
}

const statusConfig: Record<
  LoanStatus,
  { label: string; className: string }
> = {
  received: {
    label: "Received",
    className: "bg-[var(--secondary)] text-[var(--brand)] border-[var(--border)]",
  },
  verified: {
    label: "Verified",
    className: "bg-[var(--secondary)] text-[var(--primary)] border-[var(--border)]",
  },
  assigned: {
    label: "Assigned",
    className: "bg-[var(--secondary)] text-indigo-500 border-[var(--border)]",
  },
  analyzed: {
    label: "Analyzed",
    className: "bg-[var(--warning-bg)] text-[var(--warning-fg)] border-[var(--warning-fg)]/20",
  },
  approved: {
    label: "Approved",
    className: "bg-[var(--success-bg)] text-[var(--success-fg)] border-[var(--success-fg)]/20",
  },
  rejected: {
    label: "Rejected",
    className: "bg-[var(--danger-bg)] text-[var(--danger-fg)] border-[var(--danger-fg)]/20",
  },
  archived: {
    label: "Archived",
    className: "bg-[var(--secondary)] text-muted-foreground border-[var(--border)]",
  },
};

export function LoanStatusBadge({ status, className }: LoanStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn("font-semibold transition-colors", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
