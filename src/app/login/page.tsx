import Link from "next/link";
import LoginForm from "@/components/shared/LoginForm";

export default function ResidentLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <LoginForm
        expectedRole="RESIDENT"
        title="Resident Login"
        subtitle="Estate360 — generate visitor passes, track rent, raise alerts"
        accentClass="bg-slate-900 hover:bg-slate-800"
        demoEmail="resident@estate360.com"
      />
      <p className="mt-6 text-sm text-slate-500">
        New resident?{" "}
        <Link href="/register" className="font-medium text-slate-900 underline">
          Create an account
        </Link>
      </p>
      <div className="mt-2 flex gap-4 text-xs text-slate-400">
        <Link href="/security/login" className="hover:underline">
          Security login
        </Link>
        <Link href="/admin/login" className="hover:underline">
          Admin login
        </Link>
      </div>
    </div>
  );
}
