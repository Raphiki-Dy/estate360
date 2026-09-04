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
      <div className="mb-4
