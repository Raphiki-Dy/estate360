import Link from "next/link";
import LoginForm from "@/components/shared/LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <LoginForm
        expectedRole="ADMIN"
        title="Estate Admin Login"
        subtitle="Estate360 — occupants, rent tracking, roles, audit logs"
        accentClass="bg-indigo-700 hover:bg-indigo-800"
        demoEmail="admin@estate360.com"
      />
      <div className="mt-6 flex gap-4 text-xs text-slate-400">
        <Link href="/login" className="hover:underline">
          Resident login
        </Link>
        <Link href="/security/login" className="hover:underline">
          Security login
        </Link>
      </div>
    </div>
  );
}
