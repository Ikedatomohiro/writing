import type { SupabaseClient } from "@supabase/supabase-js";
import type { MetricRow, Platform } from "./types";

const TABLE = "sns_metrics";

/**
 * 1ページの取得行数。PostgREST の暗黙行数上限（Supabase 既定 ~1000）と同値だと、
 * 上限が下げられた場合に1ページ目で沈黙 under-read する。安全マージンのため 500。
 */
export const PAGE_SIZE = 500;

export interface QueryFilter {
  account?: string | null;
  platform?: Platform | null;
}

/**
 * account/platform の絞り込みだけを適用する（窓では絞らない）。
 * 窓の選択（代表窓への畳み込み）は取得後に dedupeToRepresentative で行う。
 * こうすることで 24h が欠損し 1h/6h しか無い投稿も落とさない（W-b）。
 */
function buildFilteredQuery(client: SupabaseClient, filter: QueryFilter) {
  let q = client.from(TABLE).select("*");
  if (filter.account) {
    q = q.eq("account", filter.account);
  }
  if (filter.platform === "threads" || filter.platform === "x") {
    q = q.eq("platform", filter.platform);
  }
  return q;
}

function toError(error: unknown): Error {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message)
      : "insights query failed";
  return new Error(message);
}

/**
 * sns_metrics から集計対象行を「全件」取得する（ページング）。
 *
 * PostgREST の暗黙行数上限で先頭 N 行に切り詰められると横断集計が歪むため、
 * `id` 昇順で安定ソートしつつ `.range()` でページを進め、
 * ページ長が pageSize 未満になるまで全ページを連結する。
 * 窓では絞らず全窓を取得する（代表窓への畳み込みは呼び出し側の dedupeToRepresentative）。
 */
export async function fetchMetricRows(
  client: SupabaseClient,
  filter: QueryFilter = {},
  pageSize: number = PAGE_SIZE,
): Promise<MetricRow[]> {
  const all: MetricRow[] = [];
  let from = 0;

  for (;;) {
    const q = buildFilteredQuery(client, filter)
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);

    const { data, error } = (await q) as unknown as {
      data: unknown;
      error: unknown;
    };
    if (error) {
      throw toError(error);
    }

    const page = (data ?? []) as MetricRow[];
    all.push(...page);

    if (page.length < pageSize) {
      break;
    }
    from += pageSize;
  }

  return all;
}
