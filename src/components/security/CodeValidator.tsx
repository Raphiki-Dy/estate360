"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ValidateCodeResult } from "@/lib/types";
import { formatCodeForDisplay, formatDateTime, normalizeCode } from "@/lib/utils";
import {
  CheckCircle2,
  Loader2,
  ScanLine,
  ShieldAlert,
  ShieldX,
  Undo2,
  XCircle,
} from "lucide-react";

const RESULT_META: Record<
  ValidateCodeResult["result"],
  { border: string; bg: string; text: string; icon: typeof CheckCircle2; label: string }
> = {
  VALID: {
    border: "border-emerald-300",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    icon: CheckCircle2,
    label: "ACCESS GRANTED",
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

export default function CodeValidator() {
  const supabase = createClient();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidateCodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleValidate(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const { data, error: rpcError } = await supabase.rpc("validate_access_code", {
      p_code: normalizeCode(input),
    });

    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }

    const row = Array.isArray(data) ? data[0] : data;
    setResult(row as ValidateCodeResult);
    setLoading(false);
  }

  function reset() {
    setInput("");
    setResult(null);
    setError(null);
  }

  const meta = result ? RESULT_META[result.result] : null;
  const Icon = meta?.icon;
  const isGreen = result?.result === "VALID";

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <ScanLine className="h-5 w-5 text-blue-700" />
          <h2 className="font-semibold text-slate-900">Validate Gate Pass</h2>
        </div>

        <form onSubmit={handleValidate} className="space-y-3">
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="B4K-8M9"
            className="w-full rounded-xl border border-slate-300 px-4 py-4 text-center font-mono text-2xl uppercase tracking-widest outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            maxLength={12}
          />

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ScanLine className="h-5 w-5" />}
              {loading ? "Checking..." : "Validate"}
            </button>
            {result && (
              <button
                type="button"
                onClick={reset}
                className="rounded-xl border border-slate-300 px-4 py-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Next
              </button>
            )}
          </div>
        </form>
      </div>

      {result && meta && Icon && (
        <div className={`mt-4 rounded-2xl border-2 ${meta.border} ${meta.bg} p-5 text-center`}>
          <Icon className={`mx-auto mb-2 h-12 w-12 ${meta.text}`} />
          <p className={`text-xl font-bold ${meta.text}`}>{meta.label}</p>

          {result.visitor_name && (
            <div className="mt-4 space-y-1 text-left text-sm">
              <Row label="Visitor" value={result.visitor_name} />
              {result.visitor_phone && <Row label="Phone" value={result.visitor_phone} />}
              {result.unit_number && <Row label="Unit" value={result.unit_number} />}
              {result.resident_name && <Row label="Resident" value={result.resident_name} />}
              {result.expires_at && (
                <Row label={isGreen ? "Valid until" : "Expired"} value={formatDateTime(result.expires_at)} />
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
