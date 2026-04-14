type SeriesStatus = "draft" | "queued" | "posting" | "posted" | "rejected";

interface StatusBadgeProps {
  status: SeriesStatus;
  isPosted?: boolean;
}

const STATUS_STYLES: Record<SeriesStatus | "posted_override", string> = {
  draft: "bg-slate-100 text-slate-700",
  queued: "bg-orange-100 text-orange-700",
  posting: "bg-blue-100 text-blue-700",
  posted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  posted_override: "bg-green-100 text-green-700",
};

export function StatusBadge({ status, isPosted = false }: StatusBadgeProps) {
  const key = isPosted ? "posted_override" : status;
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
