# insights — plan

## 実装ステップ

1. **集計純関数** `lib/insights/aggregate.ts`（＋ `aggregate.test.ts`）— カバレッジの主戦場
   - `engagementRate(row)`: views=0/null は null。
   - `groupAverageRate(rows, keyFn)`: キー別に平均率＋n。null 率は分母から除外。
   - `withSampleFlag(groups, minN)`: n<minN を `provisional: true` に。
   - `hourlyAverageRate(rows)`: posted_at を JST 変換し 0-23 時でグルーピング。
   - `totals(rows)`: 累計 views/likes・投稿数（distinct post_id）。
   - `MIN_SAMPLE_SIZE = 5`（定数・1箇所）。
2. **型** `lib/insights/types.ts` — `MetricRow`, `GroupStat`, `InsightsSummary`。
3. **データ取得** `lib/insights/query.ts`（＋test）— Supabase から metric_window で絞って行取得（Threads=24h, X=latest）。account/platform フィルタ。
4. **API** `app/api/insights/summary/route.ts`（＋test）— `requireAuth` → query → aggregate → JSON。
5. **UI**
   - `app/(admin)/insights/page.tsx`（サーバー・取得）＋test
   - `app/(admin)/insights/InsightsCharts.tsx`（SVG 横棒・純表示）＋test
   - `app/(admin)/insights/MetricsTable.tsx`（補助）＋test
6. **middleware** 一般化 `middleware.ts`（＋`middleware.test.ts`）— `isProtected` 集合化。matcher は tight に保つ。
7. **導線** `/dashboard` にカード1枚。
8. **README** `app/(admin)/insights/README.md`。

## 影響ファイル

- 新規: `lib/insights/*`, `app/(admin)/insights/*`, `app/api/insights/summary/*`
- 変更: `middleware.ts`, `app/(admin)/dashboard/page.tsx`

## テスト計画

- 純関数は happy-dom 不要のロジックテスト。ゼロ除算・n閾値・TZ変換・空配列を網羅。
- API は `@/auth` と `@/lib/supabase/server` をモック（analytics route.test.ts パターン流用）。
- middleware は保護ルート/公開ルート双方の挙動をテスト（R2 リダイレクトループ防止）。
- コンポーネントは Testing Library（Tailwind 前提・Provider 不要）。

## リスクと対策

- R1: `metric_window`（予約語回避）— migration 済み。
- R2: 公開経路の誤保護 — matcher に公開経路を入れない＋両系統テスト。
- R5: グラフは依存ゼロ SVG に確定（Recharts 不採用）→ react-is override 不要・"use client" 不要。
