import { daysUntil, getRentStatus, RENT_STATUS_STYLES } from "@/lib/utils";
import { CalendarClock } from "lucide-react";

interface RentBadgeProps {
  rentExpiryDate: string | null;
}

export default function RentBadge({ rentExpiryDate }: RentBadgeProps) {
  const days = daysUntil(rentExpiryDate);
  const status = getRentStatus(rentExpiryDate);
  const style = RENT_STATUS_STYLES[status];

  let daysText: string;
  if (days === null) daysText = "No lease date on file";
  else if (days > 1) daysText = `${days} days remaining`;
  else if (days === 1) daysText = "1 day remaining";
  else if (days === 0) daysText = "Due today";
  else daysText = `${Math.abs(days)} days overdue`;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
          <CalendarClock className="h-5 w-5 text-slate-700" />
        </div>
        <div>
          <p className="text-sm text-slate-500">Rent / Lease Status</p>
          <p className="font-semibold text-slate-900">{daysText}</p>
        </div>
      </div>
      <span className={`rounded-full px-3 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    </div>
  );
}
