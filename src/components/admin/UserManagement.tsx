"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { OccupantRow, UserRole } from "@/lib/types";
import { CheckCircle2, Loader2, UserCog } from "lucide-react";

interface UserManagementProps {
  users: OccupantRow[];
  currentAdminId: string;
}

const ROLES: UserRole[] = ["RESIDENT", "SECURITY", "ADMIN"];

export default function UserManagement({ users: initialUsers, currentAdminId }: UserManagementProps) {
  const supabase = createClient();
  const [users, setUsers] = useState(initialUsers);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  async function handleRoleChange(userId: string, newRole: UserRole) {
    setSavingId(userId);
    setSavedId(null);

    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);

    if (!error) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      setSavedId(userId);
      setTimeout(() => setSavedId(null), 2000);
    }
    setSavingId(null);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 p-5">
        <UserCog className="h-5 w-5 text-indigo-700" />
        <h2 className="font-semibold text-slate-900">User Management</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Unit</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                <td className="px-5 py-3 font-medium text-slate-900">
                  {u.full_name}
                  {u.id === currentAdminId && (
                    <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                      you
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-slate-600">{u.units?.unit_number ?? "—"}</td>
                <td className="px-5 py-3">
                  <select
                    value={u.role}
                    disabled={u.id === currentAdminId || savingId === u.id}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                    className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3">
                  {savingId === u.id && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                  {savedId === u.id && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
        You can&apos;t change your own role from here to avoid accidentally locking yourself out.
      </p>
    </div>
  );
}
