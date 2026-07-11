import type { GroupStat, ViewStat } from "@/lib/insights/types";
import { barWidthPercent, formatRate, formatInt } from "@/lib/insights/format";

// 依存ゼロの SVG 手書き横棒。静的レンダリングのためサーバーコンポーネントのまま
// 動作し、"use client" や react-is override（Recharts の要件）を必要としない。

interface BarChartPanelProps {
  title: string;
  stats: GroupStat[];
  /** キー表示の変換（例: 時間帯 "11" -> "11時"）。 */
  keyFormatter?: (key: string) => string;
}

/** 刺さり度（平均エンゲージメント率）の横棒。n 参考値・低リーチを淡色＋注記。 */
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
                s.provisional || s.lowReach ? "opacity-40" : ""
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
                  {s.lowReach ? "・低リーチ" : ""}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface ViewsBarPanelProps {
  title: string;
  stats: ViewStat[];
  keyFormatter?: (key: string) => string;
}

/** リーチ（views 合計）の横棒。率とは別軸の「どれだけ見られたか」を示す。 */
export function ViewsBarPanel({ title, stats, keyFormatter }: ViewsBarPanelProps) {
  const maxViews = Math.max(0, ...stats.map((s) => s.totalViews));

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
              data-testid="views-bar-row"
              className="grid grid-cols-[7rem_1fr_auto] items-center gap-3"
            >
              <span className="text-xs text-slate-700 truncate" title={s.key}>
                {keyFormatter ? keyFormatter(s.key) : s.key}
              </span>
              <span
                className="relative block h-4 rounded bg-slate-100 overflow-hidden"
                aria-hidden="true"
              >
                <span
                  className="absolute inset-y-0 left-0 rounded bg-emerald-500"
                  style={{ width: `${barWidthPercent(s.totalViews, maxViews)}%` }}
                />
              </span>
              <span className="text-xs text-slate-600 tabular-nums whitespace-nowrap">
                <span className="font-semibold text-slate-900">
                  {formatInt(s.totalViews)}
                </span>{" "}
                <span className="text-slate-400">n={s.n}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
