export type Platform = "threads" | "x";

/** sns_metrics の1行（read-model）。数値列は欠損時 null。 */
export interface MetricRow {
  platform: Platform;
  account: string;
  post_id: string;
  metric_window: string;
  posted_at: string | null;
  views: number | null;
  likes: number | null;
  replies: number | null;
  reposts: number | null;
  quotes: number | null;
  saves: number | null;
  fetched_at: string;
  pattern: string | null;
  theme: string | null;
}

/** カテゴリ別（パターン/テーマ/時間帯）の平均エンゲージメント率とサンプル数。 */
export interface GroupStat {
  /** グループのキー（パターン名・テーマ名・"0".."23" の時刻）。 */
  key: string;
  /** 平均エンゲージメント率。有効サンプルが無ければ null。 */
  avgRate: number | null;
  /** 有効な率を持つ投稿数（サンプル数）。 */
  n: number;
  /** n < MIN_SAMPLE_SIZE のとき true（参考値として淡色表示）。 */
  provisional: boolean;
}

/** 全体感の虚栄指標（従）。 */
export interface Totals {
  totalViews: number;
  totalLikes: number;
  postCount: number;
}

/** /api/insights/summary のレスポンス。 */
export interface InsightsSummary {
  account: string | null;
  platform: Platform | null;
  patternStats: GroupStat[];
  themeStats: GroupStat[];
  hourlyStats: GroupStat[];
  totals: Totals;
  rowCount: number;
}
