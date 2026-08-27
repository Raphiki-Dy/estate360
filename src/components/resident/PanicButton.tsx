"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle, CheckCircle2, Loader2, Siren } from "lucide-react";

interface PanicButtonProps {
  residentId: string;
  unitId: string;
}

type SendState = "idle" | "confirming" | "sending" | "sent" | "error";

export default function PanicButton({ residentId, unitId }: PanicButtonProps) {
  const supabase = createClient();
  const [state, setState] = useState<SendState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function sendAlert() {
    setState("sending");
    setErrorMsg(null);

    const { error } = await supabase.from("emergency_alerts").insert({
      resident_id: residentId,
      unit_id: unitId,
      status: "PENDING",
    });

    if (error) {
      setErrorMsg(error.message);
      setState("error");
      return;
    }

    setState("sent");
    setTimeout(() => setState("idle"), 6000);
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Siren className="h-5 w-5 text-red-600" />
        <h2 className="font-semibold text-red-900">Emergency Alert</h2>
      </div>
      <p className="mb-4 text-sm text-red-700">
        This immediately notifies Security at the gate. Only use for genuine emergencies.
      </p>

      {state === "idle" && (
        <button
          onClick={() => setState("confirming")}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          <Siren className="h-4 w-4" />
          Trigger Panic Alert
        </button>
      )}

      {state === "confirming" && (
        <div className="space-y-2">
          <div className="flex items-start gap-2 rounded-lg bg-white px-3 py-2 text-sm text-red-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>Are you sure? Security will be alerted immediately.</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={sendAlert}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Yes, alert Security
            </button>
            <button
              onClick={() => setState("idle")}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {state === "sending" && (
        <button
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-400 px-4 py-3 text-sm font-semibold text-white"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Sending alert...
        </button>
      )}

      {state === "sent" && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-3 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          Alert sent. Security has been notified.
        </div>
      )}

      {state === "error" && (
        <div className="space-y-2">
          <div className="rounded-lg bg-white px-3 py-2 text-sm text-red-800">
            Couldn&apos;t send alert: {errorMsg}
          </div>
          <button
            onClick={sendAlert}
            className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
