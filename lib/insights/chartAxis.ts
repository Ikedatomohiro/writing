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
