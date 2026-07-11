import type {
  GroupStat,
  InsightsSummary,
  MetricRow,
  Platform,
  ViewStat,
} from "./types";

/**
 * 最小サンプル閾値（暫定値。ユーザー確定後にここだけ変更する）。
 * n < MIN_SAMPLE_SIZE のグループは「参考値」として淡色表示する。
 */
export const MIN_SAMPLE_SIZE = 5;

/**
 * 率を「低リーチ」と見なす平均 views の下限（暫定値・ここだけで変更）。
 * これ未満の平均 views を持つグループは lowReach=true とし、率チャートで淡色＋注記する
 * （除外はしない。低リーチ×高エンゲージは実在の有効な信号のため）。
 * 実データ根拠: morita の各テーマは平均 views ≈ 43 で率が 100% を超えうる。pao の
 * 主要テーマ（資産形成 avg≈11000 / プログラミング avg≈950）は十分上回るため、300 で
 * 「低リーチの率は参考」を弁別できる。
 */
export const MIN_VIEWS_FOR_RATE = 300;

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

function num(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/**
 * エンゲージメント率 = (likes+replies+reposts+quotes+saves) / views。
 * views が 0 または欠損なら null（ゼロ除算を避ける・虚偽の 0 率を作らない）。
 *
 * W-c: X では saves = bookmark_count（adapter でマップ）。つまり X 率は bookmark を分子に含む。
 * これは Threads の saves と対称にして横断比較を成立させるための意図的定義で、
 * 既存 x-analyst の X 率（bookmark 非含）とは一致しない（README「W-c」参照）。
 */
export function engagementRate(row: MetricRow): number | null {
  const views = row.views;
  if (typeof views !== "number" || views <= 0) {
    return null;
  }
  const engagement =
    num(row.likes) + num(row.replies) + num(row.reposts) + num(row.quotes) + num(row.saves);
  return engagement / views;
}

/** n が閾値未満なら参考値（provisional）。 */
export function isProvisional(n: number, minN: number = MIN_SAMPLE_SIZE): boolean {
  return n < minN;
}

function buildStat(
  key: string,
  rates: number[],
  viewsList: number[],
  minN: number,
): GroupStat {
  const n = rates.length;
  const avgRate = n === 0 ? null : rates.reduce((a, b) => a + b, 0) / n;
  const avgViews =
    viewsList.length === 0
      ? 0
      : viewsList.reduce((a, b) => a + b, 0) / viewsList.length;
  return {
    key,
    avgRate,
    n,
    provisional: isProvisional(n, minN),
    avgViews,
    lowReach: avgViews < MIN_VIEWS_FOR_RATE,
  };
}

/**
 * keyFn で行をグルーピングし、キー別の平均エンゲージメント率とサンプル数を返す。
 * - 率が null（views=0 等）の行はサンプルに数えない。
 * - キーが null/空 の行は無視する。
 * - 併せて平均 views（avgViews）と低リーチ印（lowReach）を付す（除外はしない）。
 * - avgRate 降順（null は末尾）で返す。
 */
export function groupAverageRate(
  rows: MetricRow[],
  keyFn: (row: MetricRow) => string | null | undefined,
  minN: number = MIN_SAMPLE_SIZE,
): GroupStat[] {
  const rateBuckets = new Map<string, number[]>();
  const viewsBuckets = new Map<string, number[]>();
  for (const row of rows) {
    const key = keyFn(row);
    if (!key) continue;
    if (!rateBuckets.has(key)) {
      rateBuckets.set(key, []);
      viewsBuckets.set(key, []);
    }
    const rate = engagementRate(row);
    if (rate === null) continue; // views=0 等は率/リーチのサンプルにしない（グループ自体は残す）
    rateBuckets.get(key)!.push(rate);
    viewsBuckets.get(key)!.push(num(row.views));
  }
  const stats = Array.from(rateBuckets.entries()).map(([key, rates]) =>
    buildStat(key, rates, viewsBuckets.get(key)!, minN),
  );
  return sortByRateDesc(stats);
}

/**
 * keyFn で行をグルーピングし、キー別の views 合計（リーチ）と n を降順で返す。
 * 率とは別軸の「規模（どれだけ見られたか）」指標。キーが null/空 の行は無視する。
 */
export function groupSumViews(
  rows: MetricRow[],
  keyFn: (row: MetricRow) => string | null | undefined,
): ViewStat[] {
  const buckets = new Map<string, { totalViews: number; n: number }>();
  for (const row of rows) {
    const key = keyFn(row);
    if (!key) continue;
    if (!buckets.has(key)) buckets.set(key, { totalViews: 0, n: 0 });
    const b = buckets.get(key)!;
    b.totalViews += num(row.views);
    b.n += 1;
  }
  return Array.from(buckets.entries())
    .map(([key, b]) => ({ key, totalViews: b.totalViews, n: b.n }))
    .sort((a, b) => b.totalViews - a.totalViews);
}

function sortByRateDesc(stats: GroupStat[]): GroupStat[] {
  return stats.sort((a, b) => {
    if (a.avgRate === null && b.avgRate === null) return 0;
    if (a.avgRate === null) return 1;
    if (b.avgRate === null) return -1;
    return b.avgRate - a.avgRate;
  });
}

/**
 * posted_at を JST(+9h) に変換し、投稿時刻（0-23 の hour）別に平均率を集計する。
 * posted_at が null/不正な行は無視する。時刻キーは "0".."23" の文字列。
 */
export function hourlyAverageRate(
  rows: MetricRow[],
  minN: number = MIN_SAMPLE_SIZE,
): GroupStat[] {
  return groupAverageRate(
    rows,
    (row) => {
      if (!row.posted_at) return null;
      const ms = Date.parse(row.posted_at);
      if (Number.isNaN(ms)) return null;
      const jst = new Date(ms + JST_OFFSET_MS);
      return String(jst.getUTCHours());
    },
    minN,
  );
}

/** 累計 views/likes と投稿数（distinct post_id）。虚栄指標（従）。 */
export function totals(rows: MetricRow[]): {
  totalViews: number;
  totalLikes: number;
  postCount: number;
} {
  let totalViews = 0;
  let totalLikes = 0;
  const posts = new Set<string>();
  for (const row of rows) {
    totalViews += num(row.views);
    totalLikes += num(row.likes);
    posts.add(row.post_id);
  }
  return { totalViews, totalLikes, postCount: posts.size };
}

/**
 * 行群から InsightsSummary を構築する。
 * pattern/theme は Threads 行のみ（X は該当次元を持たない）、hourly と totals は全行。
 */
export function buildSummary(
  rows: MetricRow[],
  account: string | null,
  platform: Platform | null,
): InsightsSummary {
  const threadsRows = rows.filter((r) => r.platform === "threads");
  return {
    account,
    platform,
    patternStats: groupAverageRate(threadsRows, (r) => r.pattern),
    themeStats: groupAverageRate(threadsRows, (r) => r.theme),
    hourlyStats: hourlyAverageRate(rows),
    themeViews: groupSumViews(threadsRows, (r) => r.theme),
    accountViews: groupSumViews(rows, (r) => r.account),
    totals: totals(rows),
    rowCount: rows.length,
  };
}
