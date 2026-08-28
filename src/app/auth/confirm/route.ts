import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DASHBOARD_ROUTES, type UserRole } from "@/lib/types";

/**
 * Handles Supabase email confirmation links (signup, magic link, recovery,
 * etc). Supabase's default email templates point here as:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type={{ .Type }}
 *
 * On success, this verifies the token, establishes a real session, and
 * sends the person straight into their role dashboard instead of dropping
 * them on the homepage.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}/login?error=missing_confirmation_params`);
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const role = profile?.role as UserRole | undefined;
  const destination = role ? DASHBOARD_ROUTES[role] : "/login";

  return NextResponse.redirect(`${origin}${destination}?confirmed=true`);
}
