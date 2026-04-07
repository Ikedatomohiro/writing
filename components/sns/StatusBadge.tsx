import type { SnsSeriesStatus } from "@/lib/types/sns";

interface StatusBadgeProps {
  status: SnsSeriesStatus;
  isPosted?: boolean;
}

const STATUS_STYLES: Record<SnsSeriesStatus | "posted", string> = {
  draft: "bg-slate-100 text-slate-700",
  queued: "bg-orange-100 text-orange-700",
  posted: "bg-green-100 text-green-700",
};

export function StatusBadge({ status, isPosted = false }: StatusBadgeProps) {
  const key = isPosted ? "posted" : status;
  const label = isPosted ? "posted" : status;

  return (
    <span
      data-testid="status-badge"
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[key]}`}
    >
      {label}
    </span>
  );
}
