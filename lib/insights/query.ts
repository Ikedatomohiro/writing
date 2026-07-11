import type { MetricRow, Platform } from "./types";

const TABLE = "sns_metrics";
/** 集計に使う代表窓。Threads は 24h、X は latest（伸びカーブは初回スコープ外）。 */
const THREADS_WINDOW = "24h";
const X_WINDOW = "latest";

export interface QueryFilter {
  account?: string | null;
  platform?: Platform | null;
}

/** 最小限の supabase クエリビルダ型（テストでモックしやすいよう狭く定義）。 */
interface QueryBuilder {
  select(cols: string): QueryBuilder;
  eq(col: string, val: string): QueryBuilder;
  in(col: string, vals: string[]): QueryBuilder;
  then(
    onfulfilled: (res: { data: unknown; error: unknown }) => unknown,
  ): unknown;
}
interface SupabaseLike {
  from(table: string): QueryBuilder;
}

/**
 * sns_metrics から集計対象行を取得する。
 * platform 未指定なら Threads(24h) と X(latest) の代表窓のみ取得（1h/6h は除外）。
 */
export async function fetchMetricRows(
  client: SupabaseLike,
  filter: QueryFilter = {},
): Promise<MetricRow[]> {
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

  const { data, error } = (await q) as unknown as {
    data: unknown;
    error: unknown;
  };
  if (error) {
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : "insights query failed";
    throw new Error(message);
  }
  return (data ?? []) as MetricRow[];
}
