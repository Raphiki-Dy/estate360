import Link from "next/link";
import LoginForm from "@/components/shared/LoginForm";

export default function SecurityLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <LoginForm
        expectedRole="SECURITY"
        title="Security Guard Login"
        subtitle="Estate360 — validate gate passes, respond to alerts"
        accentClass="bg-blue-700 hover:bg-blue-800"
        demoEmail="guard@estate360.com"
      />
      <div className="mt-6 flex gap-4 text-xs text-slate-400">
        <Link href="/login" className="hover:underline">
          Resident login
        </Link>
        <Link href="/admin/login" className="hover:underline">
          Admin login
        </Link>
      </div>
    </div>
  );
}
