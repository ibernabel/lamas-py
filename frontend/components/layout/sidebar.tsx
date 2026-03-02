"use client";

/**
 * Navigation sidebar component.
 * Displays app logo, nav links, and user info at the bottom.
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
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-primary-foreground">L</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-sidebar-foreground">LAMaS</p>
          <p className="text-xs text-muted-foreground">Loan Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                item.disabled && "cursor-not-allowed opacity-50"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge variant="outline" className="text-xs">
                  {item.badge}
                </Badge>
              )}
              {isActive && !item.badge && (
                <ChevronRight className="h-3 w-3 opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3">
        <p className="px-3 text-xs text-muted-foreground">
          LAMaS v1.0 · Phase 6
        </p>
      </div>
    </aside>
  );
}
