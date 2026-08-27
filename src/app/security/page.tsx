import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/shared/DashboardHeader";
import CodeValidator from "@/components/security/CodeValidator";
import AlertBanner from "@/components/security/AlertBanner";
import type { EmergencyAlertWithDetails } from "@/lib/types";

export default async function SecurityPortalPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/security/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "SECURITY") redirect("/security/login");

  const { data: pendingAlerts } = await supabase
    .from("emergency_alerts")
    .select("*, units(unit_number), profiles(full_name, phone)")
    .eq("status", "PENDING")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader
        title="Security Portal"
        subtitle={profile.full_name}
        accentClass="bg-blue-700"
      />

      <AlertBanner initialAlerts={(pendingAlerts as EmergencyAlertWithDetails[]) ?? []} />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <CodeValidator />
      </main>
    </div>
  );
}
