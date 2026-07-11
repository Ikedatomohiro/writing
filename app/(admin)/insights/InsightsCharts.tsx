import type { GroupStat } from "@/lib/insights/types";
import { barWidthPercent, formatRate } from "@/lib/insights/format";

// 依存ゼロの SVG 手書き横棒。静的レンダリングのためサーバーコンポーネントのまま
// 動作し、"use client" や react-is override（Recharts の要件）を必要としない。

interface BarChartPanelProps {
  title: string;
  stats: GroupStat[];
  /** キー表示の変換（例: 時間帯 "11" -> "11時"）。 */
  keyFormatter?: (key: string) => string;
}

export function BarChartPanel({ title, stats, keyFormatter }: BarChartPanelProps) {
  const maxRate = Math.max(0, ...stats.map((s) => s.avgRate ?? 0));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <h4 className="text-sm font-semibold text-slate-900 mb-4">{title}</h4>
      {stats.length === 0 ? (
        <p data-testid="chart-empty" className="text-sm text-slate-400">
          データなし
        </p>
      ) : (
        <ul className="space-y-2.5">
          {stats.map((s) => (
            <li
              key={s.key}
              data-testid="bar-row"
              className={`grid grid-cols-[7rem_1fr_auto] items-center gap-3 ${
                s.provisional ? "opacity-40" : ""
              }`}
            >
              <span className="text-xs text-slate-700 truncate" title={s.key}>
                {keyFormatter ? keyFormatter(s.key) : s.key}
              </span>
              <span
                className="relative block h-4 rounded bg-slate-100 overflow-hidden"
                aria-hidden="true"
              >
                <span
                  className="absolute inset-y-0 left-0 rounded bg-indigo-500"
                  style={{ width: `${barWidthPercent(s.avgRate, maxRate)}%` }}
                />
              </span>
              <span className="text-xs text-slate-600 tabular-nums whitespace-nowrap">
                <span className="font-semibold text-slate-900">
                  {formatRate(s.avgRate)}
                </span>{" "}
                <span className="text-slate-400">
                  n={s.n}
                  {s.provisional ? "（参考値）" : ""}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
