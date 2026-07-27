"use client";

/**
 * Login page with email/password form and SoliPres shadcn/ui styling.
 * Uses NextAuth.js v5 signIn with Credentials provider.
 * Includes ThemeToggle for switching between light and dark modes.
 */
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, LogIn } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border bg-card shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Sign in</CardTitle>
        <CardDescription>
          Enter your credentials to access the dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
              className="bg-card text-foreground border-border focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
              className="bg-card text-foreground border-border focus-visible:ring-primary"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive border border-destructive/20"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-brand-hover shadow-sm"
            disabled={loading}
            id="login-submit-button"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Sign in
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function LoginFormSkeleton() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 transition-colors">
      {/* Absolute Theme Toggle at top right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <span className="text-xl font-bold">L</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">LAMaS</h1>
          <p className="text-sm text-muted-foreground">
            Loan Applications Management System
          </p>
        </div>

        {/* Login form wrapped in Suspense for useSearchParams */}
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-muted-foreground">
          LAMaS · SoluFime Loan Management System
        </p>
      </div>
    </div>
  );
}
