# insights（SNS エンゲージメント解析）— spec

- 出典: `agents/planner/proposals/sns_dashboard_loop_20260711/round2_revised.md`（正の仕様書）
- スコープ: Phase 2（表示レイヤ）。Phase 1（ingest）は content-pipeline 側で完了済み。

## 目的・背景

pao/rin/matsumoto を Threads/X 横断でエンゲージメントを可視化する。現状は JSON を直接読むしかなく、
人間が全体像（アカウント×プラットフォームのエンゲージメント率比較）を掴む経路がゼロ。この死角を埋める。

## データソース

Supabase `sns_metrics`（read-model・一方向派生）。分析経路（run_analyst）は読まない。

## 要件（機能）

1. `/insights` ページ（サーバーコンポーネント）で `sns_metrics` を集計表示する。
2. 主指標＝エンゲージメント率。Threads `(likes+replies+reposts+quotes+saves)/views`、X 同様（views 分母）。
3. 横棒グラフ（依存ゼロの SVG 手書き）で以下を比較表示:
   - パターン別平均率（Threads のみ）
   - テーマ別平均率（Threads のみ）
   - 時間帯別平均率（JST 変換・両プラットフォーム）
4. KPI カード（従・虚栄指標）: 累計 views/likes・投稿数。
5. 投稿単位テーブル（補助・最小）: 異常値の目視用。
6. `/api/insights/summary`（GET・`requireAuth` 準拠）で集計 JSON を返す。
7. アカウント／プラットフォームでフィルタ可能。

## 非機能要件・制約

- ゼロ除算: views=0 は率=null（「—」表示）。0 扱い禁止。
- サンプル数 n を必ず併記。n<`MIN_SAMPLE_SIZE`(=5, 暫定) は淡色＋「参考値」。定数は1箇所で変更可能に。
- TZ: sns_metrics は UTC 保存。時間帯別は取得後に JST(+9h) 変換。
- X は pattern/theme を持たない → パターン別/テーマ別は Threads のみ。
- Threads の window は実データ上 24h のみ（1h/6h は欠損）。集計は 24h（Threads）/latest（X）を採用。
- 認証: middleware を保護パス全般へ一般化（`/insights`＋既存 `/dashboard,/threads,/x`）。公開ブログ経路（`/asset`,`/tech`,`/health`）は絶対に保護しない。API は `requireAuth`。
- スタイリング: Tailwind v4 のみ（Chakra 不使用）。グラフは依存ゼロ SVG。

## 成功基準

- 純関数（率・n・閾値抑制・時間帯集計）のユニットテストが通り、カバレッジ 80% 以上。
- 保護ルートは未認証でリダイレクト、公開ブログ経路はリダイレクトしない（テストで担保）。
- `/dashboard` に `/insights` への導線カードが1枚ある。
