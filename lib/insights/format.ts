/** エンゲージメント率をパーセント表記に。null は em dash（未評価）。 */
export function formatRate(rate: number | null): string {
  if (rate === null) return "—";
  return `${(rate * 100).toFixed(1)}%`;
}

/** 整数に千区切りを入れる。 */
export function formatInt(n: number): string {
  return n.toLocaleString("en-US");
}

/** 横棒の幅（%）。max を 100% に正規化。max<=0 や value=null は 0。 */
export function barWidthPercent(value: number | null, max: number): number {
  if (value === null || max <= 0) return 0;
  return (value / max) * 100;
}
