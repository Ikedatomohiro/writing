import type { DailyPoint } from "@/lib/insights/types";
import { formatInt } from "@/lib/insights/format";

// 依存ゼロの SVG 折れ線。InsightsCharts と同じ方針でサーバーコンポーネントのまま動作し、
// "use client" や react-is override（Recharts の要件）を必要としない。
// view と like はスケールが桁違いのため、共有軸に重ねず「別グラフを縦に並列」する
// （各メトリクスが自身の y 軸で最大化される）。

const VIEW_BOX_W = 640;
const VIEW_BOX_H = 160;
const PAD_X = 8;
const PAD_Y = 12;

interface MetricPanelProps {
  testId: string;
  title: string;
  color: string;
  /** 日付昇順の (date, value) 列。 */
  series: { date: string; value: number }[];
}

/** 単一メトリクスの折れ線パネル。max を上端、0 を下端に正規化する。 */
function MetricPanel({ testId, title, color, series }: MetricPanelProps) {
  const max = Math.max(0, ...series.map((s) => s.value));
  const innerW = VIEW_BOX_W - PAD_X * 2;
  const innerH = VIEW_BOX_H - PAD_Y * 2;

  // x は等間隔。点が1個のときは中央に置く（0除算回避）。
  const xAt = (i: number): number => {
    if (series.length <= 1) return VIEW_BOX_W / 2;
    return PAD_X + (innerW * i) / (series.length - 1);
  };
  const yAt = (value: number): number => {
    if (max <= 0) return VIEW_BOX_H - PAD_Y;
    return PAD_Y + innerH * (1 - value / max);
  };

  const linePoints = series.map((s, i) => `${xAt(i)},${yAt(s.value)}`).join(" ");

  return (
    <div
      data-testid={testId}
      className="bg-white border border-slate-200 rounded-2xl p-5"
    >
      <div className="flex items-baseline justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        {series.length > 0 && (
          <span className="text-xs text-slate-400 tabular-nums">
            最大 <span className="font-semibold text-slate-700">{formatInt(max)}</span>
          </span>
        )}
      </div>

      {series.length === 0 ? (
        <p data-testid="chart-empty" className="text-sm text-slate-400">
          データなし
        </p>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${VIEW_BOX_W} ${VIEW_BOX_H}`}
            className="w-full h-40"
            role="img"
            aria-label={`${title}の日次推移`}
            preserveAspectRatio="none"
          >
            {series.length > 1 && (
              <polyline
                points={linePoints}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )}
            {series.map((s, i) => (
              <circle
                key={s.date}
                data-testid="trend-dot"
                cx={xAt(i)}
                cy={yAt(s.value)}
                r={3}
                fill={color}
              >
                <title>{`${s.date}: ${formatInt(s.value)}`}</title>
              </circle>
            ))}
          </svg>
          <div className="mt-2 flex justify-between text-[10px] text-slate-400 tabular-nums">
            <span>{series[0].date}</span>
            {series.length > 1 && <span>{series[series.length - 1].date}</span>}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * 公開日別の views / likes 推移を縦に並列表示する。
 * データは日付昇順の DailyPoint[]（buildSummary.dailySeries）。
 */
export function DailyTrendChart({ data }: { data: DailyPoint[] }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <MetricPanel
        testId="daily-trend-views"
        title="日次 views（公開日別・合計）"
        color="#10b981"
        series={data.map((d) => ({ date: d.date, value: d.views }))}
      />
      <MetricPanel
        testId="daily-trend-likes"
        title="日次 likes（公開日別・合計）"
        color="#6366f1"
        series={data.map((d) => ({ date: d.date, value: d.likes }))}
      />
    </div>
  );
}
