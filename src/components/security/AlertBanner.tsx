"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { EmergencyAlert, EmergencyAlertWithDetails } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { CheckCircle2, Phone, Siren } from "lucide-react";

interface AlertBannerProps {
  initialAlerts: EmergencyAlertWithDetails[];
}

export default function AlertBanner({ initialAlerts }: AlertBannerProps) {
  const supabase = createClient();
  const [alerts, setAlerts] = useState<EmergencyAlertWithDetails[]>(initialAlerts);
  const [resolving, setResolving] = useState<string | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel("emergency_alerts:security")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "emergency_alerts" },
        async (payload) => {
          const alert = payload.new as EmergencyAlert;
          if (alert.status !== "PENDING") return;

          // Enrich with resident/unit details for display.
          const [{ data: profile }, { data: unit }] = await Promise.all([
            supabase.from("profiles").select("full_name, phone").eq("id", alert.resident_id).single(),
            supabase.from("units").select("unit_number").eq("id", alert.unit_id).single(),
          ]);

          setAlerts((prev) => [
            { ...alert, profiles: profile ?? null, units: unit ?? null },
            ...prev,
          ]);

          // Audible cue for a genuine emergency, best-effort.
          try {
            type WindowWithWebkitAudio = typeof window & { webkitAudioContext?: typeof AudioContext };
            const win = window as WindowWithWebkitAudio;
            const AudioCtx = win.AudioContext || win.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            osc.type = "square";
            osc.frequency.value = 880;
            osc.connect(ctx.destination);
            osc.start();
            setTimeout(() => {
              osc.stop();
              ctx.close();
            }, 400);
          } catch {
            // ignore — audio is a nice-to-have, not critical path
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "emergency_alerts" },
        (payload) => {
          const updated = payload.new as EmergencyAlert;
          setAlerts((prev) =>
            updated.status === "RESOLVED"
              ? prev.filter((a) => a.id !== updated.id)
              : prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function resolveAlert(id: string) {
    setResolving(id);
    const { error } = await supabase
      .from("emergency_alerts")
      .update({ status: "RESOLVED", resolved_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }
    setResolving(null);
  }

  const pending = alerts.filter((a) => a.status === "PENDING");

  if (pending.length === 0) return null;

  return (
    <div className="sticky top-[57px] z-30 space-y-2 border-b border-red-300 bg-red-600 px-4 py-3 sm:px-6">
      {pending.map((alert) => (
        <div
          key={alert.id}
          className="flex flex-col gap-2 rounded-xl bg-white/95 p-3 shadow-lg sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 animate-pulse items-center justify-center rounded-full bg-red-600">
              <Siren className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-red-700">
                EMERGENCY — Unit {alert.units?.unit_number ?? "Unknown"}
              </p>
              <p className="text-sm text-slate-700">
                {alert.profiles?.full_name ?? "Unknown resident"}
                {alert.profiles?.phone && (
                  <span className="ml-2 inline-flex items-center gap-1 text-slate-500">
                    <Phone className="h-3 w-3" /> {alert.profiles.phone}
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-400">Triggered {formatDateTime(alert.created_at)}</p>
            </div>
          </div>
          <button
            onClick={() => resolveAlert(alert.id)}
            disabled={resolving === alert.id}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            <CheckCircle2 className="h-4 w-4" />
            {resolving === alert.id ? "Resolving..." : "Mark Resolved"}
          </button>
        </div>
      ))}
    </div>
  );
}
