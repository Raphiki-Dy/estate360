import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Alphanumeric charset for visitor pass codes.
 * Excludes 0, O, 1, I to avoid confusion when read aloud at the gate
 * or misread on a phone screen. Must match the DB CHECK constraint
 * in schema.sql (chk_access_codes_code_charset).
 */
const CODE_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Generates a random 6-character alphanumeric code, e.g. "B4K8M9". */
export function generateAccessCode(length = 6): string {
  let code = "";
  const bytes = new Uint8Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < length; i++) {
    code += CODE_CHARSET[bytes[i] % CODE_CHARSET.length];
  }
  return code;
}

/** Formats a stored code "B4K8M9" for display as "B4K-8M9". */
export function formatCodeForDisplay(code: string): string {
  const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (clean.length <= 3) return clean;
  return `${clean.slice(0, 3)}-${clean.slice(3)}`;
}

/** Strips dashes/spaces and uppercases, for sending a raw code to the DB. */
export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export type RentStatus = "ACTIVE" | "DUE_SOON" | "OVERDUE" | "UNKNOWN";

/** Days remaining until rent_expiry_date. Negative = overdue. */
export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function getRentStatus(dateStr: string | null): RentStatus {
  const days = daysUntil(dateStr);
  if (days === null) return "UNKNOWN";
  if (days < 0) return "OVERDUE";
  if (days <= 14) return "DUE_SOON";
  return "ACTIVE";
}

export const RENT_STATUS_STYLES: Record<RentStatus, { bg: string; text: string; label: string }> = {
  ACTIVE: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Active" },
  DUE_SOON: { bg: "bg-amber-100", text: "text-amber-700", label: "Due Soon" },
  OVERDUE: { bg: "bg-red-100", text: "text-red-700", label: "Overdue" },
  UNKNOWN: { bg: "bg-slate-100", text: "text-slate-600", label: "Unknown" },
};

export const ACCESS_CODE_STATUS_STYLES: Record<
  "ACTIVE" | "USED" | "EXPIRED" | "REVOKED",
  { bg: string; text: string; label: string }
> = {
  ACTIVE: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Active" },
  USED: { bg: "bg-slate-200", text: "text-slate-600", label: "Used" },
  EXPIRED: { bg: "bg-amber-100", text: "text-amber-700", label: "Expired" },
  REVOKED: { bg: "bg-red-100", text: "text-red-700", label: "Revoked" },
};

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function buildWhatsAppShareUrl(params: {
  visitorName: string;
  code: string;
  unitNumber: string;
  expiresAt: string;
  phone?: string | null;
}): string {
  const { visitorName, code, unitNumber, expiresAt, phone } = params;
  const expiresText = new Date(expiresAt).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const message =
    `Hi ${visitorName}, here is your Estate360 gate pass.\n` +
    `Code: ${formatCodeForDisplay(code)}\n` +
    `Unit: ${unitNumber}\n` +
    `Valid until: ${expiresText}\n` +
    `Show this code to the security guard at the gate.`;
  const encoded = encodeURIComponent(message);
  const target = phone ? phone.replace(/[^\d+]/g, "") : "";
  return `https://wa.me/${target}?text=${encoded}`;
}
