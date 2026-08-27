"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AccessCode } from "@/lib/types";
import { ACCESS_CODE_STATUS_STYLES, formatCodeForDisplay, formatDateTime } from "@/lib/utils";
import { History } from "lucide-react";

interface CodesListProps {
  residentId: string;
  initialCodes: AccessCode[];
}

export default function CodesList({ residentId, initialCodes }: CodesListProps) {
  const supabase = createClient();
  const [codes, setCodes] = useState<AccessCode[]>(initialCodes);

  useEffect(() => {
    const channel = supabase
      .channel(`access_codes:resident:${residentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "access_codes",
          filter: `resident_id=eq.${residentId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setCodes((prev) => [payload.new as AccessCode, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setCodes((prev) =>
              prev.map((c) => (c.id === (payload.new as AccessCode).id ? (payload.new as AccessCode) : c))
            );
          } else if (payload.eventType === "DELETE") {
            setCodes((prev) => prev.filter((c) => c.id !== (payload.old as AccessCode).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [residentId, supabase]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <History className="h-5 w-5 text-slate-700" />
        <h2 className="font-semibold text-slate-900">Recent Passes</h2>
      </div>

      {codes.length === 0 ? (
        <p className="text-sm text-slate-500">No passes generated yet.</p>
      ) : (
        <div className="space-y-2">
          {codes.map((c) => {
            const style = ACCESS_CODE_STATUS_STYLES[c.status];
            return (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{c.visitor_name}</p>
                  <p className="font-mono text-xs text-slate-500">
                    {formatCodeForDisplay(c.code)} · expires {formatDateTime(c.expires_at)}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
                  {style.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
