/**
 * Authenticated proxy route for serving local document files.
 *
 * WHY THIS EXISTS:
 * Browsers cannot send Authorization headers when loading resources via
 * <iframe src> or <img src>. This means we can't protect FastAPI's
 * /documents/download/{key} endpoint via Bearer token from the browser directly.
 *
 * This Next.js route handler solves the problem by acting as a proxy:
 *   1. Browser requests /api/proxy/documents/[...path] (same origin, port 3000).
 *   2. Next.js checks the NextAuth session — returns 401 if not logged in.
 *   3. If authenticated, fetches the file from FastAPI with the Bearer token.
 *   4. Streams the response back to the browser.
 *
 * Future work: add role/permission checks here when RBAC is implemented.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // 1. Verify the user is authenticated via NextAuth session
  const session = await auth();
  if (!session?.accessToken) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 2. Build the FastAPI file-serving URL from the captured path segments
  //    Input path:  ["clients", "1", "nid", "20260310_filename.jpg"]
  //    FastAPI URL: http://localhost:8001/api/v1/documents/download/clients/1/nid/...
  const { path } = await params;
  const fileKey = path.join("/");
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
  const backendUrl = `${apiBase}/documents/download/${fileKey}`;

  // 3. Fetch from FastAPI with the user's Bearer token
  const backendResponse = await fetch(backendUrl, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!backendResponse.ok) {
    return new NextResponse("File not found", {
      status: backendResponse.status,
    });
  }

  // 4. Stream the response body back, preserving Content-Type and Content-Disposition
  const contentType =
    backendResponse.headers.get("Content-Type") ?? "application/octet-stream";
  const contentDisposition = backendResponse.headers.get(
    "Content-Disposition"
  ) ?? "inline";

  return new NextResponse(backendResponse.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": contentDisposition,
    },
  });
}
