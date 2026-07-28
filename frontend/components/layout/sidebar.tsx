"use client";

/**
 * Navigation sidebar component.
 * Displays SoluFime/SoliPres branded logo, nav links, and version badge.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { APP_VERSION, APP_VERSION_SHORT } from "@/lib/version";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    label: "Loan Applications",
    href: "/loans",
    icon: FileText,
  },
  {
    label: "Credit Analysis",
    href: "/analysis",
    icon: BarChart3,
    badge: "Phase 8",
    disabled: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar transition-colors">
      {/* Logo Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
            <span className="text-sm font-bold text-primary-foreground">L</span>
          </div>
          <div>
            <p className="text-sm font-bold text-sidebar-foreground">LAMaS</p>
            <p className="text-[11px] text-muted-foreground">Loan Management</p>
          </div>
        </div>
        <span className="rounded bg-sidebar-accent px-1.5 py-0.5 text-[10px] font-semibold text-sidebar-primary">
          v{APP_VERSION_SHORT}
        </span>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 p-3">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.disabled ? "#" : item.href}
              aria-disabled={item.disabled}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-xs"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                item.disabled && "cursor-not-allowed opacity-50"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                  {item.badge}
                </Badge>
              )}
              {isActive && !item.badge && (
                <ChevronRight className="h-3 w-3 opacity-80" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="border-t border-sidebar-border p-3">
        <p className="px-3 text-xs text-muted-foreground">
          SoluFime · LAMaS py v{APP_VERSION}
        </p>
      </div>
    </aside>
  );
}
