import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LAMaS — Loan Applications Management System",
    template: "%s | LAMaS",
  },
  description:
    "LAMaS is a modern loan applications management system for financial institutions.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicons/coins-solid.ico", sizes: "32x32" },
    ],
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <QueryProvider>
          {children}
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
