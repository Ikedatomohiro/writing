import { unstable_cache } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { fetchMetricRows } from "@/lib/insights/query";
import { buildSummary } from "@/lib/insights/aggregate";
import type { InsightsSummary, MetricRow, Platform } from "@/lib/insights/types";
import { InsightsView } from "./InsightsView";

const ACCOUNTS = ["pao-pao-cho", "matsumoto_sho", "morita_rin"];

// データ取得＋集計を 1 時間キャッシュする（B1）。sns_metrics は日次同期（A）で更新される
// 低頻度データのため 1h の陳腐化は許容範囲。cold start と毎訪問の全件フェッチを消す。
// 認証は middleware がリクエスト毎に実行するのでキャッシュ対象外。
const CACHE_TTL_SECONDS = 3600;

/** account/platform 別に読み取り＋集計をキャッシュ。行データも表用に同梱して返す。 */
const getCachedInsights = unstable_cache(
  async (
    account: string | null,
    platform: Platform | null,
  ): Promise<{ summary: InsightsSummary; rows: MetricRow[] }> => {
    const client = createServerClient();
    const rows = await fetchMetricRows(client, { account, platform });
    return { summary: buildSummary(rows, account, platform), rows };
  },
  // キャッシュキーの版番号。Vercel の Data Cache はデプロイをまたいで永続するため、
  // 集計ロジックを変えたら版を上げて旧エントリを捨てる（さもないと revalidate(1h)まで
  // 旧集計の値が配信されうる）。v2: dailySeries に運用開始前(2010〜2025 の古い X 投稿)を
  // 除外する SERVICE_START_DATE フィルタを導入したため、v1 の陳腐化エントリを破棄する。
  ["insights-summary-v2"],
  { revalidate: CACHE_TTL_SECONDS, tags: ["insights"] },
);

function parseAccount(raw?: string): string | null {
  return raw && ACCOUNTS.includes(raw) ? raw : null;
}

function parsePlatform(raw?: string): Platform | null {
  return raw === "threads" || raw === "x" ? raw : null;
}

async function loadInsights(
  account: string | null,
  platform: Platform | null,
): Promise<{ summary: InsightsSummary; rows: MetricRow[]; error: boolean }> {
  try {
    const { summary, rows } = await getCachedInsights(account, platform);
    return { summary, rows, error: false };
  } catch {
    return {
      summary: buildSummary([], account, platform),
      rows: [],
      error: true,
    };
  }
}

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string; platform?: string }>;
}) {
  const sp = await searchParams;
  const account = parseAccount(sp.account);
  const platform = parsePlatform(sp.platform);

  const { summary, rows, error } = await loadInsights(account, platform);

  return (
    <InsightsView
      summary={summary}
      rows={rows}
      account={account}
      platform={platform}
      error={error}
    />
  );
}
