import type { Metadata, Viewport } from "next";

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
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 flex flex-col justify-between">
      <main className="w-full flex-1 flex flex-col items-center justify-center p-3 sm:p-6">
        {children}
      </main>
    </div>
  );
}
