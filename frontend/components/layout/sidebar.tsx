"use client";

/**
 * Navigation sidebar component.
 * Displays SoluFime/SoliPres branded logo, nav links, version badge,
 * and a toggle button for collapsed/expanded mode.
 */
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out select-none",
        isCollapsed ? "w-14" : "w-64"
      )}
    >
      {/* Logo Header */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-sidebar-border transition-all duration-300",
          isCollapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className={cn(
              "flex shrink-0 items-center justify-center rounded-lg bg-primary shadow-xs transition-all duration-300",
              isCollapsed ? "h-7 w-7" : "h-8 w-8"
            )}
          >
            <span className={cn("font-bold text-primary-foreground", isCollapsed ? "text-xs" : "text-sm")}>
              L
            </span>
          </div>
          {!isCollapsed && (
            <div className="whitespace-nowrap transition-opacity duration-200">
              <p className="text-sm font-bold text-sidebar-foreground">LAMaS</p>
              <p className="text-[11px] text-muted-foreground">Loan Management</p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <span className="rounded bg-sidebar-accent px-1.5 py-0.5 text-[10px] font-semibold text-sidebar-primary">
            v{APP_VERSION_SHORT}
          </span>
        )}
      </div>

      {/* Toggle Button & Menu Header */}
      <div
        className={cn(
          "flex items-center py-2 transition-all duration-300",
          isCollapsed ? "justify-center px-1" : "justify-between px-3"
        )}
      >
        {!isCollapsed && (
          <p className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Menu
          </p>
        )}
        <Button
          id="sidebar-toggle-button"
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-7 w-7 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 p-2">
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
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "group flex items-center rounded-md font-medium transition-all",
                isCollapsed
                  ? "h-9 w-9 justify-center mx-auto"
                  : "gap-3 px-3 py-2 text-sm",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-xs"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                item.disabled && "cursor-not-allowed opacity-50"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!isCollapsed && item.badge && (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 shrink-0">
                  {item.badge}
                </Badge>
              )}
              {!isCollapsed && isActive && !item.badge && (
                <ChevronRight className="h-3 w-3 shrink-0 opacity-80" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="border-t border-sidebar-border p-2 text-center">
        {isCollapsed ? (
          <span
            className="text-[10px] text-muted-foreground font-semibold cursor-default block"
            title={`SoluFime · LAMaS py v${APP_VERSION}`}
          >
            v{APP_VERSION_SHORT}
          </span>
        ) : (
          <p className="px-1 text-xs text-muted-foreground truncate">
            SoluFime · LAMaS py v{APP_VERSION}
          </p>
        )}
      </div>
    </aside>
  );
}


