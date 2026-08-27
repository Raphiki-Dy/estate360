import Link from "next/link";
import { Building2, ShieldCheck, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900">
          <Building2 className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-3xl font-semibold text-slate-900">Estate360</h1>
        <p className="mt-2 text-slate-500">
          Visitor access, rent tracking &amp; emergency alerts — in one hub.
        </p>
      </div>

      <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-3">
        <Link
          href="/login"
          className="group rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:border-slate-400 hover:shadow-md"
        >
          <Users className="mx-auto mb-2 h-6 w-6 text-slate-700" />
          <p className="font-medium text-slate-900">Resident</p>
          <p className="text-xs text-slate-500">Generate passes, pay rent, raise alerts</p>
        </Link>

        <Link
          href="/security/login"
          className="group rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:border-blue-400 hover:shadow-md"
        >
          <ShieldCheck className="mx-auto mb-2 h-6 w-6 text-blue-700" />
          <p className="font-medium text-slate-900">Security Guard</p>
          <p className="text-xs text-slate-500">Validate codes at the gate</p>
        </Link>

        <Link
          href="/admin/login"
          className="group rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:border-indigo-400 hover:shadow-md"
        >
          <Building2 className="mx-auto mb-2 h-6 w-6 text-indigo-700" />
          <p className="font-medium text-slate-900">Estate Admin</p>
          <p className="text-xs text-slate-500">Occupants, rent, roles, audit logs</p>
        </Link>
      </div>

      <p className="mt-8 text-sm text-slate-500">
        New resident?{" "}
        <Link href="/register" className="font-medium text-slate-900 underline">
          Register here
        </Link>
      </p>
    </div>
  );
}
