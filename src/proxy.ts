import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "./lib/supabase/middleware";
import { isSupabaseConfigured } from "./lib/supabase/config";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // When Supabase credentials are not configured (e.g. no .env.local yet),
  // updateSession() would throw while creating the @supabase/ssr client and
  // every /login, /register, /dashboard and /admin request would crash with a
  // 500. Skip session handling in that case — the client-side ProtectedRoute
  // still gates protected pages with its in-app login screen and demo accounts.
  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  const { supabaseResponse, user } = await updateSession(request);

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  // Protect dashboard and admin routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from login/register to dashboard
  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
