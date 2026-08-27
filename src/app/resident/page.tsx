import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/shared/DashboardHeader";
import RentBadge from "@/components/resident/RentBadge";
import VisitorCodeForm from "@/components/resident/VisitorCodeForm";
import PanicButton from "@/components/resident/PanicButton";
import CodesList from "@/components/resident/CodesList";

export default async function ResidentDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, units(unit_number)")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
  if (profile.role !== "RESIDENT") redirect("/login");

  if (!profile.unit_id) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardHeader
          title="Resident Dashboard"
          subtitle={profile.full_name}
          accentClass="bg-slate-900"
        />
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
            <p className="font-medium">No unit assigned yet</p>
            <p className="mt-1 text-sm">
              Your account isn&apos;t linked to a unit. Please contact the estate admin to get
              assigned before you can generate visitor passes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { data: codes } = await supabase
    .from("access_codes")
    .select("*")
    .eq("resident_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const unitNumber = (profile.units as { unit_number: string } | null)?.unit_number ?? "—";

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader
        title="Resident Dashboard"
        subtitle={`${profile.full_name} · Unit ${unitNumber}`}
        accentClass="bg-slate-900"
      />

      <main className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6">
        <RentBadge rentExpiryDate={profile.rent_expiry_date} />

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <VisitorCodeForm
              residentId={user.id}
              unitId={profile.unit_id}
              unitNumber={unitNumber}
            />
          </div>
          <div>
            <PanicButton residentId={user.id} unitId={profile.unit_id} />
          </div>
        </div>

        <CodesList residentId={user.id} initialCodes={codes ?? []} />
      </main>
    </div>
  );
}
