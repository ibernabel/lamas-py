"use client";

import { Badge } from "@/components/ui/badge";
import type { LoanStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/use-translation";

interface LoanStatusBadgeProps {
  status: LoanStatus;
  className?: string;
}

const statusColorConfig: Record<LoanStatus, string> = {
  received: "bg-[var(--secondary)] text-[var(--brand)] border-[var(--border)]",
  verified: "bg-[var(--secondary)] text-[var(--primary)] border-[var(--border)]",
  assigned: "bg-[var(--secondary)] text-indigo-500 border-[var(--border)]",
  analyzed: "bg-[var(--warning-bg)] text-[var(--warning-fg)] border-[var(--warning-fg)]/20",
  approved: "bg-[var(--success-bg)] text-[var(--success-fg)] border-[var(--success-fg)]/20",
  rejected: "bg-[var(--danger-bg)] text-[var(--danger-fg)] border-[var(--danger-fg)]/20",
  archived: "bg-[var(--secondary)] text-muted-foreground border-[var(--border)]",
};

export function LoanStatusBadge({ status, className }: LoanStatusBadgeProps) {
  const { t } = useTranslation();
  const colorStyle = statusColorConfig[status] ?? "bg-secondary text-secondary-foreground";
  const translatedLabel = t(`status.${status}`, status);

  return (
    <Badge
      variant="outline"
      className={cn("font-semibold transition-colors capitalize", colorStyle, className)}
    >
      {translatedLabel}
    </Badge>
  );
}
