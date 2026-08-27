"use client";

import type { OccupantRow } from "@/lib/types";
import { daysUntil, getRentStatus, RENT_STATUS_STYLES } from "@/lib/utils";
import { Users } from "lucide-react";

interface OccupantTableProps {
  occupants: OccupantRow[];
}

export default function OccupantTable({ occupants }: OccupantTableProps) {
  const residents = occupants.filter((o) => o.role === "RESIDENT");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 p-5">
        <Users className="h-5 w-5 text-indigo-700" />
        <h2 className="font-semibold text-slate-900">Occupant Directory & Rent Tracking</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-medium">Resident</th>
              <th className="px-5 py-3 font-medium">Unit</th>
              <th className="px-5 py-3 font-medium">Phone</th>
              <th className="px-5 py-3 font-medium">Rent Expiry</th>
              <th className="px-5 py-3 font-medium">Days</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {residents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-slate-400">
                  No residents yet.
                </td>
              </tr>
            )}
            {residents.map((r) => {
              const status = getRentStatus(r.rent_expiry_date);
              const style = RENT_STATUS_STYLES[status];
              const days = daysUntil(r.rent_expiry_date);
              return (
                <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-5 py-3 font-medium text-slate-900">{r.full_name}</td>
                  <td className="px-5 py-3 text-slate-600">{r.units?.unit_number ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-600">{r.phone ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {r.rent_expiry_date
                      ? new Date(r.rent_expiry_date).toLocaleDateString("en-NG", { dateStyle: "medium" })
                      : "—"}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {days === null ? "—" : days < 0 ? `${Math.abs(days)} overdue` : `${days}d`}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
                      {style.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
