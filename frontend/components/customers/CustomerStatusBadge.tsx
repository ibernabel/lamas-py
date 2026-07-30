"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/use-translation";

interface CustomerStatusBadgeProps {
  isActive: boolean;
  className?: string;
}

export function CustomerStatusBadge({ isActive, className }: CustomerStatusBadgeProps) {
  const { t } = useTranslation();

  const colorStyle = isActive
    ? "bg-[var(--success-bg)] text-[var(--success-fg)] border-[var(--success-fg)]/20"
    : "bg-[var(--danger-bg)] text-[var(--danger-fg)] border-[var(--danger-fg)]/20";

  return (
    <Badge
      variant="outline"
      className={cn("font-semibold transition-colors capitalize rounded-full px-2.5 py-0.5 text-xs shadow-2xs", colorStyle, className)}
    >
      {isActive ? t("status.active") : t("status.inactive")}
    </Badge>
  );
}
