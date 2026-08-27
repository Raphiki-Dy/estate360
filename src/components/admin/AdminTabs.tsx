"use client";

import { useState } from "react";
import type { OccupantRow, AccessCodeWithUnit } from "@/lib/types";
import OccupantTable from "@/components/admin/OccupantTable";
import UserManagement from "@/components/admin/UserManagement";
import AuditLog from "@/components/admin/AuditLog";
import { ScrollText, UserCog, Users } from "lucide-react";

interface AdminTabsProps {
  occupants: OccupantRow[];
  auditEntries: AccessCodeWithUnit[];
  currentAdminId: string;
}

type Tab = "occupants" | "users" | "audit";

const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "occupants", label: "Occupants & Rent", icon: Users },
  { id: "users", label: "User Management", icon: UserCog },
  { id: "audit", label: "Audit Logs", icon: ScrollText },
];

export default function AdminTabs({ occupants, auditEntries, currentAdminId }: AdminTabsProps) {
  const [tab, setTab] = useState<Tab>("occupants");

  return (
    <div>
      <div className="mb-5 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab === id ? "bg-indigo-700 text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {tab === "occupants" && <OccupantTable occupants={occupants} />}
      {tab === "users" && <UserManagement users={occupants} currentAdminId={currentAdminId} />}
      {tab === "audit" && <AuditLog entries={auditEntries} />}
    </div>
  );
}
