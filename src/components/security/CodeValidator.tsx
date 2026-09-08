"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ValidateCodeResult } from "@/lib/types";
import { formatCodeForDisplay, formatDateTime, normalizeCode } from "@/lib/utils";
import {
  CheckCircle2,
  Eye,
  Loader2,
  ScanLine,
  ShieldAlert,
  ShieldX,
  Undo2,
  XCircle,
} from "lucide-react";

type ResultKind = ValidateCodeResult["result"] | "ACTIVE";

const RESULT_META: Record
  ResultKind,
  { border: string; bg: string; text: string; icon: typeof CheckCircle2; label: string }
> = {
  VALID: {
    border: "border-emerald-300",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    icon: CheckCircle2,
    label: "ACCESS GRANTED",
  },
  ACTIVE: {
    border: "border-blue-300",
    bg: "bg-blue-50",
    text: "text-blue-800",
    icon: Eye,
    label: "STILL ACTIVE - NOT YET USED",
  },
  USED: {
    border: "border-amber-300",
    bg: "bg-amber-50",
    text: "text-amber-800",
    icon: Undo2,
    label: "ALREADY USED",
  },
  EXPIRED: {
    border: "border-red-300",
    bg: "bg-red-50",
    text: "text-red-800",
    icon: XCircle,
    label: "EXPIRED",
  },
  REVOKED: {
    border: "border-red-300",
    bg: "bg-red-50",
    text: "text-red-800",
    icon: ShieldX,
    label: "REVOKED",
  },
  INVALID: {
    border: "border-red-300",
    bg: "bg-red-50",
    text: "text-red-800",
    icon: ShieldAlert,
    label: "INVALID CODE",
  },
};

type Mode = "lookup" | "checkin";

export default function CodeValidator() {
  const supabase = createClient();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState<Mode | null>(null);
  const [result, setResult] = useState<ValidateCodeResult | null>(null);
  const [lastMode, setLastMode] = useState<Mode | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runLookup(mode: Mode) {
    if (!input.trim()) return;
    setLoading(mode);
    setError(null);
    setResult(null);

    const rpcName = mode === "lookup" ? "lookup_access_code" : "validate_access_code";
    const { data, error: rpcError } = await supabase.rpc(rpcName, {
      p_code: normalizeCode(input),
    });

    if (rpcError) {
      setError(rpcError.message);
      setLoading(null);
      return;
    }

    const row = Array.isArray(data) ? data[0] : data;
    setResult(row as ValidateCodeResult);
    setLastMode(mode);
    setLoading(null);
  }

  function reset() {
    setInput("");
    setResult(null);
    setLastMode(null);
    setError(null);
  }

  const resultKind: ResultKind | null = result
    ? lastMode === "lookup" && (result.result as string) === "ACTIVE"
      ? "ACTIVE"
      : result.result
    : null;
  const meta = resultKind ? RESULT_META[resultKind] : null;
  const Icon = meta?.icon;

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <ScanLine className="h-5 w-5 text-blue-700" />
          <h2 className="font-semibold text-slate-900">Gate Pass Code</h2>
        </div>

        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="B4K-8M9"
          className="mb-3 w-full rounded-xl border border-slate-300 px-4 py-4 text-center font-mono text-2xl uppercase tracking-widest outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          maxLength={12}
        />

        {error && (
          <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => runLookup("lookup")}
            disabled={loading !== null || !input.trim()}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-blue-700 px-3 py-3.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-50"
          >
            {loading === "lookup" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            Look Up
          </button>
          <button
            type="button"
            onClick={() => runLookup("checkin")}
            disabled={loading !== null || !input.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-3 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
          >
            {loading === "checkin" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ScanLine className="h-4 w-4" />
            )}
            Check In
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-slate-400">
          Look Up just checks the status. Check In marks the pass as used.
        </p>

        {result && (
          <button
            type="button"
            onClick={reset}
            className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Next code
          </button>
        )}
      </div>

      {result && meta && Icon && (
        <div className={`mt-4 rounded-2xl border-2 ${meta.border} ${meta.bg} p-5 text-center`}>
          <Icon className={`mx-auto mb-2 h-12 w-12 ${meta.text}`} />
          <p className={`text-xl font-bold ${meta.text}`}>{meta.label}</p>
          {lastMode === "lookup" && (
            <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
              Status only - pass not consumed
            </p>
          )}

          {result.visitor_name && (
            <div className="mt-4 space-y-1 text-left text-sm">
              <Row label="Visitor" value={result.visitor_name} />
              {result.visitor_phone && <Row label="Phone" value={result.visitor_phone} />}
              {result.unit_number && <Row label="Unit" value={result.unit_number} />}
              {result.resident_name && <Row label="Resident" value={result.resident_name} />}
              {result.vehicle_plate && <Row label="Vehicle Plate" value={result.vehicle_plate} />}
              {result.expires_at && (
                <Row
                  label={resultKind === "EXPIRED" ? "Expired" : "Valid until"}
                  value={formatDateTime(result.expires_at)}
                />
              )}
            </div>
          )}

          {!result.visitor_name && (
            <p className="mt-2 text-sm text-red-700">
              No pass found for &ldquo;{formatCodeForDisplay(input)}&rdquo;
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-black/5 py-1.5 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}
