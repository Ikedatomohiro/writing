import type { SupabaseClient } from "@supabase/supabase-js";
import type { MetricRow, Platform } from "./types";

const TABLE = "sns_metrics";
/** 集計に使う代表窓。Threads は 24h、X は latest（伸びカーブは初回スコープ外）。 */
const THREADS_WINDOW = "24h";
const X_WINDOW = "latest";

/**
 * 1ページの取得行数。PostgREST の暗黙行数上限（Supabase 既定 ~1000）に依存すると
 * 全アカウント横断集計が沈黙切り捨てされるため、明示ページングで全行を引く（D1 対応）。
 */
export const PAGE_SIZE = 1000;

export interface QueryFilter {
  account?: string | null;
  platform?: Platform | null;
}

/** account/platform/代表窓の絞り込みだけを適用したクエリを都度構築する。 */
function buildFilteredQuery(client: SupabaseClient, filter: QueryFilter) {
  let q = client.from(TABLE).select("*");
  if (filter.account) {
    q = q.eq("account", filter.account);
  }
  if (filter.platform === "threads") {
    q = q.eq("platform", "threads").eq("metric_window", THREADS_WINDOW);
  } else if (filter.platform === "x") {
    q = q.eq("platform", "x").eq("metric_window", X_WINDOW);
  } else {
    q = q.in("metric_window", [THREADS_WINDOW, X_WINDOW]);
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
 * platform 未指定なら Threads(24h) と X(latest) の代表窓のみ取得（1h/6h は除外）。
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
