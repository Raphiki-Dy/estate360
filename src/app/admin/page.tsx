import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/shared/DashboardHeader";
import AdminTabs from "@/components/admin/AdminTabs";
import type { AccessCodeWithUnit, OccupantRow } from "@/lib/types";

export default async function AdminPortalPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "ADMIN") redirect("/admin/login");

  const [{ data: occupants }, { data: auditEntries }] = await Promise.all([
    supabase.from("profiles").select("*, units(unit_number)").order("full_name"),
    supabase
      .from("access_codes")
      .select("*, units(unit_number), profiles!access_codes_resident_id_fkey(full_name)")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader
        title="Estate Admin Portal"
        subtitle={profile.full_name}
        accentClass="bg-indigo-700"
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <AdminTabs
          occupants={(occupants as OccupantRow[]) ?? []}
          auditEntries={(auditEntries as AccessCodeWithUnit[]) ?? []}
          currentAdminId={user.id}
        />
      </main>
    </div>
  );
}
