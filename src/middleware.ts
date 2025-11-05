import { type NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * This is a super easy middleware for you to use, and it only has one job:
 * It checks if the user is authenticated, and if not, redirects to the login page.
 *
 * If you need more functionality, follow the docs here: https://nextjs.org/docs/app/api-reference/file-conventions/middleware
 */
export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Very simple auth check with redirect if not authenticated.
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // Restrict access to admin routes to admin users only
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/admin")) {
    // Session user type from better-auth may not include custom fields; access defensively
    const rawRole = (session.user as Record<string, unknown> | undefined)?.role;
    const role = typeof rawRole === "string" ? rawRole : undefined;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }
  return NextResponse.next();
}
export const config = {
  runtime: "nodejs",
  // Apply middleware to dashboard, admin and debug routes
  matcher: ["/dashboard/:path*", "/admin/:path*", "/debug/:path*"],
};
