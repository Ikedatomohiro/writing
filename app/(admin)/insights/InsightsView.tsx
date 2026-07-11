import Link from "next/link";
import { getAccountLabel } from "@/lib/constants/labels";
import { formatInt } from "@/lib/insights/format";
import { MIN_SAMPLE_SIZE } from "@/lib/insights/aggregate";
import type { InsightsSummary, MetricRow, Platform } from "@/lib/insights/types";
import { BarChartPanel } from "./InsightsCharts";
import { MetricsTable } from "./MetricsTable";

const ACCOUNTS = ["pao-pao-cho", "matsumoto_sho", "morita_rin"] as const;

interface InsightsViewProps {
  summary: InsightsSummary;
  rows: MetricRow[];
  account: string | null;
  platform: Platform | null;
  error: boolean;
}

function buildHref(account: string | null, platform: Platform | null): string {
  const params = new URLSearchParams();
  if (account) params.set("account", account);
  if (platform) params.set("platform", platform);
  const qs = params.toString();
  return qs ? `/insights?${qs}` : "/insights";
}

function FilterChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
        active
          ? "bg-indigo-600 text-white border-indigo-600"
          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
      }`}
    >
      {label}
    </Link>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
    </div>
  );
}

export function InsightsView({
  summary,
  rows,
  account,
  platform,
  error,
}: InsightsViewProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold font-headline text-on-surface mb-2">
        エンゲージメント解析
      </h2>
      <p className="text-slate-600 text-sm mb-6">
        Threads / X を横断して投稿の伸びを可視化します（Supabase の read-model を表示）。
      </p>

      {error ? (
        <div
          data-testid="insights-error"
          className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          メトリクスの取得に失敗しました。sns_metrics テーブルの適用・ingest 状況を確認してください。
        </div>
      ) : null}

      <div data-testid="insights-filters" className="mb-6 space-y-2">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-400 w-20">アカウント</span>
          <FilterChip label="すべて" href={buildHref(null, platform)} active={account === null} />
          {ACCOUNTS.map((a) => (
            <FilterChip
              key={a}
              label={getAccountLabel(a)}
              href={buildHref(a, platform)}
              active={account === a}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-400 w-20">プラットフォーム</span>
          <FilterChip label="すべて" href={buildHref(account, null)} active={platform === null} />
          <FilterChip label="Threads" href={buildHref(account, "threads")} active={platform === "threads"} />
          <FilterChip label="X" href={buildHref(account, "x")} active={platform === "x"} />
        </div>
      </div>

      <section data-testid="kpi-cards" className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard label="累計 views" value={formatInt(summary.totals.totalViews)} />
          <KpiCard label="累計 likes" value={formatInt(summary.totals.totalLikes)} />
          <KpiCard label="投稿数" value={formatInt(summary.totals.postCount)} />
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChartPanel title="パターン別 平均エンゲージメント率（Threads）" stats={summary.patternStats} />
        <BarChartPanel title="テーマ別 平均エンゲージメント率（Threads）" stats={summary.themeStats} />
        <BarChartPanel
          title="時間帯別 平均エンゲージメント率（JST）"
          stats={summary.hourlyStats}
          keyFormatter={(k) => `${k}時`}
        />
      </section>

      <p className="text-xs text-slate-400 mb-8">
        n はサンプル数。n&lt;{MIN_SAMPLE_SIZE} のカテゴリは「参考値」として淡色表示しています（閾値は暫定）。
        エンゲージメント率 = (いいね+返信+リポスト+引用+保存) / views。views=0 は「—」。
      </p>

      <section>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          投稿単位メトリクス（異常値の確認用）
        </h3>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <MetricsTable rows={rows} />
        </div>
      </section>
    </div>
  );
}
