"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Building2, LogOut } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  accentClass: string; // e.g. "bg-slate-900" / "bg-blue-700" / "bg-indigo-700"
}

export default function DashboardHeader({ title, subtitle, accentClass }: DashboardHeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${accentClass}`}>
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-slate-900">{title}</p>
            {subtitle && <p className="text-xs leading-tight text-slate-500">{subtitle}</p>}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </header>
  );
}
