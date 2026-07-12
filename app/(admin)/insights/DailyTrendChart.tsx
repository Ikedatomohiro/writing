import type { DailyPoint } from "@/lib/insights/types";
import { formatInt } from "@/lib/insights/format";
import { monthlyTicks, yAxisTicks } from "@/lib/insights/chartAxis";

// 依存ゼロの SVG 折れ線。InsightsCharts と同じ方針でサーバーコンポーネントのまま動作し、
// "use client" や react-is override（Recharts の要件）を必要としない。
// view と like はスケールが桁違いのため、共有軸に重ねず「別グラフを縦に並列」する
// （各メトリクスが自身の y 軸で最大化される）。
//
// 軸ラベルは SVG 内 <text> ではなく HTML 要素で描く。viewBox は preserveAspectRatio="none"
// で横に引き伸ばされるため、SVG 内テキストは水平方向に歪む。ラベルを SVG の外側に HTML で
// 重ねれば歪まない（グリッド線は水平/垂直のみなので SVG 内 <line> で問題ない）。

const VIEW_BOX_W = 640;
const VIEW_BOX_H = 160;
const PAD_X = 8;
const PAD_Y = 12;
// Y 軸目盛の段数（0 を含め Y_STEPS+1 段）。
const Y_STEPS = 4;

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
  const yTicks = yAxisTicks(max, Y_STEPS);
  const xTicks = monthlyTicks(series.map((s) => s.date));
  // ホバー用の当たり判定は各点を中心とした縦帯。点(r=3)より広く取り、密な日次点でも
  // 狙いやすくする（透明矩形は fill="transparent" で pointer を受け、<title> を出す）。
  const bandW = series.length > 1 ? innerW / (series.length - 1) : innerW;

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
        <div className="flex gap-1.5">
          {/* 縦軸ラベル（HTML）。SVG と同じ高さで % 配置し目盛線に揃える。 */}
          <div className="relative w-10 h-40 shrink-0">
            {yTicks.map((v) => (
              <span
                key={v}
                data-testid="y-tick"
                className="absolute right-0 -translate-y-1/2 text-[10px] text-slate-400 tabular-nums"
                style={{ top: `${(yAt(v) / VIEW_BOX_H) * 100}%` }}
              >
                {formatInt(Math.round(v))}
              </span>
            ))}
          </div>

          {/* プロット列（SVG + 横軸ラベル）。幅は viewBox 幅 = 100% に対応。 */}
          <div className="flex-1 min-w-0">
            <svg
              viewBox={`0 0 ${VIEW_BOX_W} ${VIEW_BOX_H}`}
              className="w-full h-40"
              role="img"
              aria-label={`${title}の日次推移`}
              preserveAspectRatio="none"
            >
              {/* 横グリッド線（縦軸目盛位置）。 */}
              {yTicks.map((v) => (
                <line
                  key={v}
                  x1={PAD_X}
                  x2={VIEW_BOX_W - PAD_X}
                  y1={yAt(v)}
                  y2={yAt(v)}
                  stroke="#e2e8f0"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
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
                />
              ))}
              {/* ホバー当たり判定（透明・点より広い縦帯）。ネイティブ <title> ツールチップ。 */}
              {series.map((s, i) => (
                <rect
                  key={s.date}
                  data-testid="trend-hover-band"
                  x={xAt(i) - bandW / 2}
                  y={0}
                  width={bandW}
                  height={VIEW_BOX_H}
                  fill="transparent"
                >
                  <title>{`${s.date}: ${formatInt(s.value)}`}</title>
                </rect>
              ))}
            </svg>

            {/* 横軸ラベル（HTML）。月初の点に "YYYY-MM" を配置。 */}
            <div className="relative h-4 mt-1">
              {xTicks.map((t) => (
                <span
                  key={t.label}
                  data-testid="x-tick"
                  className="absolute -translate-x-1/2 whitespace-nowrap text-[10px] text-slate-400 tabular-nums"
                  style={{ left: `${(xAt(t.index) / VIEW_BOX_W) * 100}%` }}
                >
                  {t.label}
                </span>
              ))}
            </div>
          </div>
        </div>
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
