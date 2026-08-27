"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DASHBOARD_ROUTES, type UserRole } from "@/lib/types";
import { Loader2, LogIn, ShieldAlert } from "lucide-react";

interface LoginFormProps {
  expectedRole: UserRole;
  title: string;
  subtitle: string;
  accentClass: string; // tailwind classes for the button/icon accent
  demoEmail: string;
}

export default function LoginForm({
  expectedRole,
  title,
  subtitle,
  accentClass,
  demoEmail,
}: LoginFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState(demoEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setError("Sign-in succeeded but no user was returned. Please try again.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      setError("We couldn't find a profile for this account. Contact an estate admin.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    if (profile.role !== expectedRole) {
      setError(
        `This account is registered as ${profile.role}, not ${expectedRole}. Redirecting you to the right dashboard...`
      );
      setTimeout(() => {
        router.push(DASHBOARD_ROUTES[profile.role as UserRole]);
      }, 1200);
      return;
    }

    router.push(DASHBOARD_ROUTES[expectedRole]);
    router.refresh();
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div
          className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${accentClass}`}
        >
          <LogIn className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            placeholder="you@estate360.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-60 ${accentClass}`}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-slate-400">
        Demo password for seeded accounts: <span className="font-mono">Password123!</span>
      </p>
    </div>
  );
}
