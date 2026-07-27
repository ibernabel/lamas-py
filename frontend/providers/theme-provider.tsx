"use client";

/**
 * NextThemes provider wrapper component.
 * Enables theme toggling (light/dark/system) with CSS class switching.
 */
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
