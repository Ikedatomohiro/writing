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
  /** グループ内の平均 views（リーチ）。率の信頼性判断に併用。 */
  avgViews: number;
  /** avgViews < MIN_VIEWS_FOR_RATE のとき true。低リーチで率が過大に出やすい印。 */
  lowReach: boolean;
}

/** カテゴリ別の views（リーチ）合計とサンプル数。刺さり度（率）と別軸の規模指標。 */
export interface ViewStat {
  key: string;
  /** views 合計（リーチの規模）。 */
  totalViews: number;
  /** 投稿数。 */
  n: number;
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
  /** 刺さり度（平均エンゲージメント率）。 */
  patternStats: GroupStat[];
  themeStats: GroupStat[];
  hourlyStats: GroupStat[];
  /** リーチ（views 合計）。率と別軸で並置する規模指標。 */
  themeViews: ViewStat[];
  accountViews: ViewStat[];
  totals: Totals;
  rowCount: number;
}
