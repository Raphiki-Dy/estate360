import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DASHBOARD_ROUTES, LOGIN_ROUTES, type UserRole } from "@/lib/types";

const PROTECTED_PREFIXES: Record<string, UserRole> = {
  "/resident": "RESIDENT",
  "/security": "SECURITY",
  "/admin": "ADMIN",
};

// Sub-paths under each prefix that are login pages, not protected areas.
const LOGIN_SUFFIXES = ["/login"];

function isLoginPath(pathname: string): boolean {
  return LOGIN_SUFFIXES.some((suffix) => pathname.endsWith(suffix));
}

/**
 * Refreshes the Supabase session cookie on every request, then enforces
 * role-based routing:
 *  - Unauthenticated users hitting a protected area -> sent to that
 *    area's login page.
 *  - Authenticated users hitting the wrong role's area (or a login page
 *    they've already passed) -> redirected to their own dashboard.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const matchedPrefix = Object.keys(PROTECTED_PREFIXES).find((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!matchedPrefix) {
    return supabaseResponse; // public route (/, /register, etc.)
  }

  const requiredRole = PROTECTED_PREFIXES[matchedPrefix];
  const onLoginPage = isLoginPath(pathname);

  if (!user) {
    if (onLoginPage) return supabaseResponse; // let them reach the login form
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_ROUTES[requiredRole];
    return NextResponse.redirect(url);
  }

  // Authenticated — look up their role to enforce area boundaries.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role as UserRole | undefined;

  if (!role) {
    return supabaseResponse; // profile not provisioned yet; let page-level logic handle it
  }

  if (onLoginPage) {
    // Already signed in — bounce straight to their dashboard.
    const url = request.nextUrl.clone();
    url.pathname = DASHBOARD_ROUTES[role];
    return NextResponse.redirect(url);
  }

  if (role !== requiredRole) {
    // Signed in but wrong area (e.g. RESIDENT hitting /admin) — send home.
    const url = request.nextUrl.clone();
    url.pathname = DASHBOARD_ROUTES[role];
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
