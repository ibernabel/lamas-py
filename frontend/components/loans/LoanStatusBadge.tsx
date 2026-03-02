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
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100/80 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  },
  verified: {
    label: "Verified",
    className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100/80 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800",
  },
  assigned: {
    label: "Assigned",
    className: "bg-purple-100 text-purple-800 hover:bg-purple-100/80 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
  },
  analyzed: {
    label: "Analyzed",
    className: "bg-amber-100 text-amber-800 hover:bg-amber-100/80 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  },
  rejected: {
    label: "Rejected",
    className: "bg-rose-100 text-rose-800 hover:bg-rose-100/80 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
  },
  archived: {
    label: "Archived",
    className: "bg-slate-100 text-slate-800 hover:bg-slate-100/80 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800",
  },
};

export function LoanStatusBadge({ status, className }: LoanStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn("font-medium transition-colors", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
