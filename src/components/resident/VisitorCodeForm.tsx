"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  buildWhatsAppShareUrl,
  formatCodeForDisplay,
  generateAccessCode,
} from "@/lib/utils";
import { KeyRound, Loader2, MessageCircle, ShieldAlert, Sparkles } from "lucide-react";

interface VisitorCodeFormProps {
  residentId: string;
  unitId: string;
  unitNumber: string;
}

interface GeneratedCode {
  code: string;
  visitorName: string;
  visitorPhone: string;
  expiresAt: string;
}

const MAX_INSERT_ATTEMPTS = 5;

export default function VisitorCodeForm({ residentId, unitId, unitNumber }: VisitorCodeFormProps) {
  const supabase = createClient();

  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [expirationHours, setExpirationHours] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<GeneratedCode | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGenerated(null);
    setLoading(true);

    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString();

    let lastError: string | null = null;

    for (let attempt = 0; attempt < MAX_INSERT_ATTEMPTS; attempt++) {
      const code = generateAccessCode(6);

      const { error: insertError } = await supabase.from("access_codes").insert({
        code,
        visitor_name: visitorName,
        visitor_phone: visitorPhone || null,
        vehicle_plate: vehiclePlate ? vehiclePlate.toUpperCase().trim() : null,
        resident_id: residentId,
        unit_id: unitId,
        status: "ACTIVE",
        expires_at: expiresAt,
      });

      if (!insertError) {
        setGenerated({ code, visitorName, visitorPhone, expiresAt });
        setVisitorName("");
        setVisitorPhone("");
        setVehiclePlate("");
        lastError = null;
        break;
      }

      if (insertError.code !== "23505") {
        lastError = insertError.message;
        break;
      }
      lastError = insertError.message;
    }

    if (!generated && lastError) {
      setError(lastError);
    }
    setLoading(false);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-slate-700" />
        <h2 className="font-semibold text-slate-900">Generate Visitor Pass</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Visitor name</label>
            <input
              required
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Visitor phone <span className="text-slate-400">(for WhatsApp share)</span>
            </label>
            <input
              value={visitorPhone}
              onChange={(e) => setVisitorPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              placeholder="+234 801 234 5678"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Vehicle license plate <span className="text-slate-400">(optional)</span>
          </label>
          <input
            value={vehiclePlate}
            onChange={(e) => setVehiclePlate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:w-48"
            placeholder="ABC-123XY"
            maxLength={15}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Expires in (hours)</label>
          <select
            value={expirationHours}
            onChange={(e) => setExpirationHours(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:w-48"
          >
            {[1, 2, 4, 6, 12, 24, 48].map((h) => (
              <option key={h} value={h}>
                {h} {h === 1 ? "hour" : "hours"}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Generating..." : "Generate Code"}
        </button>
      </form>

      {generated && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
            Pass generated for {generated.visitorName}
          </p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-wider text-emerald-900">
            {formatCodeForDisplay(generated.code)}
          </p>
          <p className="mt-1 text-xs text-emerald-700">
            Valid until {new Date(generated.expiresAt).toLocaleString("en-NG", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
          
            href={buildWhatsAppShareUrl({
              visitorName: generated.visitorName,
              code: generated.code,
              unitNumber,
              expiresAt: generated.expiresAt,
              phone: generated.visitorPhone,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" />
            Share to WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
