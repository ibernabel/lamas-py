/**
 * Next.js middleware for route protection.
 *
 * Protects all routes under /(dashboard).
 * Unauthenticated users are redirected to /login.
 * Authenticated users visiting /login are redirected to the dashboard.
 */
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req: NextRequest & { auth: unknown }) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname.startsWith("/login");
  const isApiRoute = pathname.startsWith("/api");

  // Allow API routes to pass through
  if (isApiRoute) return NextResponse.next();

  // Redirect authenticated users away from login
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn && !isAuthPage) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Protect all routes except static files and Next.js internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
