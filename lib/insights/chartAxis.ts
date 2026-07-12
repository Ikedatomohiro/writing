/**
 * 日次推移グラフの軸目盛を生成する純関数群。
 * 描画（SVG/HTML 配置）からは分離してテスト可能にしている。
 */

/** 横軸の月目盛。 */
export interface MonthTick {
  /** "YYYY-MM"。 */
  label: string;
  /** その月が最初に現れる点の index（0 起点）。x 位置の算出に使う。 */
  index: number;
}

/**
 * 日付昇順の "YYYY-MM-DD" 列から、月が変わる最初の点を目盛として返す。
 * label は "YYYY-MM"。密な日次点でも月初だけを間引いて軸を読みやすくする。
 */
export function monthlyTicks(dates: string[]): MonthTick[] {
  const ticks: MonthTick[] = [];
  let lastMonth = "";
  dates.forEach((date, index) => {
    const month = date.slice(0, 7);
    if (month !== lastMonth) {
      ticks.push({ label: month, index });
      lastMonth = month;
    }
  });
  return ticks;
}

/**
 * 0..max を steps 等分した縦軸目盛値を昇順で返す（要素数 steps+1）。
 * max<=0 のときは [0] のみ（0 除算・無意味な目盛を避ける）。
 */
export function yAxisTicks(max: number, steps: number = 4): number[] {
  if (max <= 0) return [0];
  const ticks: number[] = [];
  for (let i = 0; i <= steps; i++) {
    ticks.push((max * i) / steps);
  }
  return ticks;
}

const MS_PER_DAY = 86_400_000;
// この日数を超える範囲は月目盛（YYYY-MM）、以下は日目盛（MM-DD 均等）にする。
// 30日窓だと月目盛は1〜2個しか出ず読めないため、短期間は日単位に切り替える。
const MONTHLY_TICK_MIN_SPAN_DAYS = 60;

/** "YYYY-MM-DD" を UTC 起点の epoch(ms) に。 */
function dateToMs(date: string): number {
  return Date.parse(`${date}T00:00:00Z`);
}

/** epoch(ms) を "YYYY-MM-DD" に（UTC）。 */
function msToDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** 2 つの "YYYY-MM-DD" 間の日数差（b - a）。 */
function daysBetween(a: string, b: string): number {
  return Math.round((dateToMs(b) - dateToMs(a)) / MS_PER_DAY);
}

/**
 * 日次点（date 昇順）を「最新データ日から過去 days 日（inclusive）」に絞る。
 * 基準は今日ではなく最新データ日。これによりデータが数日遅延・古くても常にデータが入り、
 * 純関数として時刻非依存（テスト可能・SSR/CSR で不一致が起きない）。
 * days=null は全件を返す。
 */
export function filterByPeriod<T extends { date: string }>(
  data: T[],
  days: number | null,
): T[] {
  if (days === null || data.length === 0) return data;
  const anchor = data[data.length - 1].date; // 昇順なので末尾が最新
  const cutoff = msToDate(dateToMs(anchor) - (days - 1) * MS_PER_DAY);
  return data.filter((d) => d.date >= cutoff);
}

/**
 * 期間に応じた横軸目盛。範囲が広ければ月目盛（YYYY-MM）、狭ければ MM-DD の均等目盛。
 * 30日など短い窓で月目盛が1〜2個に潰れる問題を避ける。
 */
export function dateTicks(dates: string[], maxTicks: number = 6): MonthTick[] {
  if (dates.length === 0) return [];
  const spanDays = daysBetween(dates[0], dates[dates.length - 1]);
  if (spanDays > MONTHLY_TICK_MIN_SPAN_DAYS) return monthlyTicks(dates);
  return evenlySpacedTicks(dates, maxTicks);
}

/** 先頭・末尾を含め最大 maxTicks 個を均等間隔で拾い、MM-DD ラベルを付ける。 */
function evenlySpacedTicks(dates: string[], maxTicks: number): MonthTick[] {
  const n = dates.length;
  if (n <= maxTicks) {
    return dates.map((date, index) => ({ label: date.slice(5), index }));
  }
  const step = (n - 1) / (maxTicks - 1);
  const ticks: MonthTick[] = [];
  for (let k = 0; k < maxTicks; k++) {
    const index = Math.round(k * step);
    ticks.push({ label: dates[index].slice(5), index });
  }
  // 丸めで index が重複しうるので隣接重複を除去。
  return ticks.filter((t, i) => i === 0 || t.index !== ticks[i - 1].index);
}
