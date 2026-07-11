import type { MetricRow } from "@/lib/insights/types";
import { engagementRate } from "@/lib/insights/aggregate";
import { formatRate, formatInt } from "@/lib/insights/format";

// 投稿単位の生メトリクス（補助・異常値の目視用）。デフォルトは先頭 50 行に切り詰める。
const DEFAULT_LIMIT = 50;

interface MetricsTableProps {
  rows: MetricRow[];
  limit?: number;
}

export function MetricsTable({ rows, limit = DEFAULT_LIMIT }: MetricsTableProps) {
  if (rows.length === 0) {
    return (
      <p data-testid="table-empty" className="text-sm text-slate-400">
        メトリクスがありません
      </p>
    );
  }

  const shown = rows.slice(0, limit);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-slate-400 text-left border-b border-slate-200">
            <th className="py-2 pr-3 font-medium">投稿ID</th>
            <th className="py-2 pr-3 font-medium">PF</th>
            <th className="py-2 pr-3 font-medium">窓</th>
            <th className="py-2 pr-3 font-medium text-right">views</th>
            <th className="py-2 pr-3 font-medium text-right">likes</th>
            <th className="py-2 pr-3 font-medium text-right">ER</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((r) => (
            <tr
              key={`${r.platform}-${r.post_id}-${r.metric_window}`}
              data-testid="metric-row"
              className="border-b border-slate-100 text-slate-700"
            >
              <td className="py-1.5 pr-3 font-mono truncate max-w-[10rem]" title={r.post_id}>
                {r.post_id}
              </td>
              <td className="py-1.5 pr-3">{r.platform}</td>
              <td className="py-1.5 pr-3">{r.metric_window}</td>
              <td className="py-1.5 pr-3 text-right tabular-nums">
                {formatInt(r.views ?? 0)}
              </td>
              <td className="py-1.5 pr-3 text-right tabular-nums">
                {formatInt(r.likes ?? 0)}
              </td>
              <td className="py-1.5 pr-3 text-right tabular-nums">
                {formatRate(engagementRate(r))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > limit ? (
        <p className="text-xs text-slate-400 mt-2">
          {formatInt(rows.length)} 件中 {formatInt(limit)} 件を表示
        </p>
      ) : null}
    </div>
  );
}
