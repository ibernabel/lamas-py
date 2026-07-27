import type { Metadata, Viewport } from "next";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Solicitud de Préstamo | LAMaS",
  description: "Formulario inteligente para solicitud de préstamos personales y comerciales.",
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 flex flex-col justify-between transition-colors">
      <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
        <div className="flex items-center gap-2 font-bold text-lg text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm">
            L
          </div>
          <span>LAMaS</span>
        </div>
        <ThemeToggle />
      </header>
      <main className="w-full flex-1 flex flex-col items-center justify-center p-3 sm:p-6">
        {children}
      </main>
    </div>
  );
}
