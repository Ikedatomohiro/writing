"use client";

import { useState } from "react";
import type { DailyPoint } from "@/lib/insights/types";
import { formatInt } from "@/lib/insights/format";
import { dateTicks, yAxisTicks, filterByPeriod } from "@/lib/insights/chartAxis";

// 依存ゼロの SVG 折れ線。view と like はスケールが桁違いのため、共有軸に重ねず
// 「別グラフを縦に並列」する（各メトリクスが自身の y 軸で最大化される）。
//
// ホバーで値を出すツールチップのため、このコンポーネントのみクライアントアイランド化している
// （insights ページ初のクライアント化）。当初はネイティブ SVG <title> で実装したが、本番で
// 表示まで約1秒の遅延・発見性の低さがあり UX として不十分だったため、React state 駆動の
// 即時ツールチップに切り替えた。データ取得・集計はサーバー側のまま（page.tsx）で、
// ハイドレートするのは折れ線パネルの描画のみ。
//
// 軸ラベルは SVG 内 <text> ではなく HTML で描く。viewBox は preserveAspectRatio="none" で
// 横に引き伸ばされ、SVG 内テキストは水平方向に歪むため。グリッド線は水平/垂直のみなので
// SVG 内 <line> で問題ない。

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
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

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
  const xTicks = dateTicks(series.map((s) => s.date));
  // ホバー用の当たり判定は各点を中心とした縦帯。点(r=3)より広く取り、密な日次点でも
  // 狙いやすくする（透明矩形は fill="transparent" で pointer を受ける）。
  const bandW = series.length > 1 ? innerW / (series.length - 1) : innerW;
  const hovered = hoverIdx !== null ? series[hoverIdx] : null;

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
            {yTicks.map((v, i) => {
              // 低 max（例: max=3）だと丸め後に隣接ラベルが重複（0,1,2,2,3）しうるので、
              // 直前と同じ丸め値のラベルは描かない（目盛線は別途 SVG 側で全段引く）。
              const rounded = Math.round(v);
              if (i > 0 && rounded === Math.round(yTicks[i - 1])) return null;
              return (
                <span
                  key={v}
                  data-testid="y-tick"
                  className="absolute right-0 -translate-y-1/2 text-[10px] text-slate-400 tabular-nums"
                  style={{ top: `${(yAt(v) / VIEW_BOX_H) * 100}%` }}
                >
                  {formatInt(rounded)}
                </span>
              );
            })}
          </div>

          {/* プロット列（SVG + ツールチップ + 横軸ラベル）。幅は viewBox 幅 = 100% に対応。 */}
          <div className="flex-1 min-w-0 relative">
            <svg
              viewBox={`0 0 ${VIEW_BOX_W} ${VIEW_BOX_H}`}
              className="w-full h-40"
              role="img"
              aria-label={`${title}の日次推移`}
              preserveAspectRatio="none"
              onMouseLeave={() => setHoverIdx(null)}
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
                  r={hoverIdx === i ? 4.5 : 3}
                  fill={color}
                />
              ))}
              {/* ホバー当たり判定（透明・点より広い縦帯）。onMouseEnter で state 更新。 */}
              {series.map((s, i) => (
                <rect
                  key={s.date}
                  data-testid="trend-hover-band"
                  x={xAt(i) - bandW / 2}
                  y={0}
                  width={bandW}
                  height={VIEW_BOX_H}
                  fill="transparent"
                  onMouseEnter={() => setHoverIdx(i)}
                />
              ))}
            </svg>

            {/* ツールチップ（HTML）。ホバー中の点の直上に日付＋値を即時表示。 */}
            {hovered && (
              <div
                data-testid="trend-tooltip"
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-slate-900 px-2 py-1 text-center text-[11px] leading-tight text-white shadow-lg"
                style={{
                  left: `${(xAt(hoverIdx!) / VIEW_BOX_W) * 100}%`,
                  top: `calc(${(yAt(hovered.value) / VIEW_BOX_H) * 100}% - 6px)`,
                }}
              >
                <div className="font-semibold tabular-nums whitespace-nowrap">{hovered.date}</div>
                <div className="tabular-nums">{formatInt(hovered.value)}</div>
              </div>
            )}

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

/** 期間プリセット。days=null は全期間。デフォルトは 30 日。 */
const PERIOD_PRESETS: { id: string; label: string; days: number | null }[] = [
  { id: "30", label: "30日", days: 30 },
  { id: "90", label: "90日", days: 90 },
  { id: "all", label: "全期間", days: null },
];
const DEFAULT_PERIOD_DAYS = 30;

interface PeriodSelectorProps {
  value: number | null;
  onChange: (days: number | null) => void;
}

/** 期間切替のセグメントコントロール（views/likes 両グラフに共通で効く）。 */
function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div
      data-testid="period-selector"
      role="group"
      aria-label="表示期間"
      className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5"
    >
      {PERIOD_PRESETS.map((p) => {
        const active = p.days === value;
        return (
          <button
            key={p.id}
            type="button"
            data-testid={`period-option-${p.id}`}
            aria-pressed={active}
            onClick={() => onChange(p.days)}
            className={
              "rounded-md px-3 py-1 text-xs font-medium transition-colors " +
              (active
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700")
            }
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * 公開日別の views / likes 推移を縦に並列表示する。
 * データは日付昇順の DailyPoint[]（buildSummary.dailySeries）。
 * 期間セレクタで表示範囲を絞る（既定=過去30日）。フィルタはクライアント state で行い、
 * サーバー再取得は不要（y 軸・目盛は絞った系列から都度再計算されるため期間に追従する）。
 */
export function DailyTrendChart({ data }: { data: DailyPoint[] }) {
  const [periodDays, setPeriodDays] = useState<number | null>(DEFAULT_PERIOD_DAYS);
  const visible = filterByPeriod(data, periodDays);

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex justify-end">
        <PeriodSelector value={periodDays} onChange={setPeriodDays} />
      </div>
      <MetricPanel
        testId="daily-trend-views"
        title="日次 views（公開日別・合計）"
        color="#10b981"
        series={visible.map((d) => ({ date: d.date, value: d.views }))}
      />
      <MetricPanel
        testId="daily-trend-likes"
        title="日次 likes（公開日別・合計）"
        color="#6366f1"
        series={visible.map((d) => ({ date: d.date, value: d.likes }))}
      />
    </div>
  );
}
