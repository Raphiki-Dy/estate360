import type { AccessCodeWithUnit } from "@/lib/types";
import { ACCESS_CODE_STATUS_STYLES, formatCodeForDisplay, formatDateTime } from "@/lib/utils";
import { ScrollText } from "lucide-react";

interface AuditLogProps {
  entries: AccessCodeWithUnit[];
}

export default function AuditLog({ entries }: AuditLogProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 p-5">
        <ScrollText className="h-5 w-5 text-indigo-700" />
        <h2 className="font-semibold text-slate-900">Gate Entry Audit Log</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-medium">Code</th>
              <th className="px-5 py-3 font-medium">Visitor</th>
              <th className="px-5 py-3 font-medium">Vehicle</th>
              <th className="px-5 py-3 font-medium">Unit</th>
              <th className="px-5 py-3 font-medium">Resident</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Created</th>
              <th className="px-5 py-3 font-medium">Used</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-6 text-center text-slate-400">
                  No gate activity yet.
                </td>
              </tr>
            )}
            {entries.map((e) => {
              const style = ACCESS_CODE_STATUS_STYLES[e.status];
              return (
                <tr key={e.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-5 py-3 font-mono text-slate-700">{formatCodeForDisplay(e.code)}</td>
                  <td className="px-5 py-3 text-slate-900">{e.visitor_name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">{e.vehicle_plate ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-600">{e.units?.unit_number ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-600">{e.profiles?.full_name ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
                      {style.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{formatDateTime(e.created_at)}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDateTime(e.used_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
