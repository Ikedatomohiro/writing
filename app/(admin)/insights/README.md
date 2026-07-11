# insights — SNS エンゲージメント解析

Threads / X を横断して投稿のエンゲージメントを可視化する管理画面（`/insights`）。
JSON を直接読まずに「アカウント×プラットフォームのエンゲージメント率比較」を掴むための経路。

## 改善ループでの位置づけ

```
[生成] threads-creator / x-creator が投稿
      ↓
[取得] fetcher が content-data の history/posts.json・x_history/posts.json を更新
      ↓
[ingest] backfill_sns_metrics.py / upsert_sns_metrics.py が Supabase sns_metrics へ upsert（一方向・冪等）
      ↓
[表示] /insights がこの read-model を集計表示（← 本機能）
      ↓
[判断] 人間が伸びるパターン/テーマ/時間帯を把握し、次の生成方針に反映
```

`sns_metrics` はローカル JSON からの**一方向・冪等な派生プロジェクション（read-model）**。
分析経路（run_analyst 等）はこのテーブルを読まないため、ingest が遅れても生成判断は汚染されない
（＝第二の真実源にならない）。この画面は表示専用で、JSON にも Supabase にも書き込まない。

## データフロー

- 取得元テーブル: Supabase `sns_metrics`（`writing/supabase/migrations/20260711000000_sns_metrics.sql`）
- 代表窓: Threads=`24h` / X=`latest`（1h/6h は初回スコープ外）
- ingest スクリプト: `content-pipeline/threads-creator/scripts/`
  - `backfill_sns_metrics.py` — 全アカウント一括の一回性 backfill（`--dry-run` 可）
  - `upsert_sns_metrics.py` — 日次 recurring upsert（`ACTIVE_ACCOUNT`）

## 指標定義

- **エンゲージメント率（主）** = `(likes + replies + reposts + quotes + saves) / views`。
  `views=0` は率 = null（「—」表示）。0 扱いはしない（虚偽の 0% を作らない）。
- **パターン別／テーマ別**（Threads のみ。X は該当次元を持たない）
- **時間帯別**（JST 変換・両プラットフォーム）
- **累計 views/likes・投稿数**（虚栄指標・従）

各カテゴリ集計には n（サンプル数）を併記。`n < MIN_SAMPLE_SIZE`（暫定 5）のカテゴリは
「参考値」として淡色表示する。閾値は `lib/insights/aggregate.ts` の `MIN_SAMPLE_SIZE` 1 箇所で変更する。

## 構成

| 種別 | パス | 役割 |
|---|---|---|
| ページ（サーバー） | `app/(admin)/insights/page.tsx` | searchParams 検証 → 取得 → ビュー描画 |
| ビュー（純表示） | `app/(admin)/insights/InsightsView.tsx` | フィルタ・KPI・グラフ・テーブルの組み立て |
| グラフ | `app/(admin)/insights/InsightsCharts.tsx` | 依存ゼロの SVG 手書き横棒（`"use client"` 不要） |
| テーブル | `app/(admin)/insights/MetricsTable.tsx` | 投稿単位の生メトリクス（異常値確認用） |
| 集計純関数 | `lib/insights/aggregate.ts` | 率・n併記・閾値抑制・時間帯 JST 集計・buildSummary |
| 取得 | `lib/insights/query.ts` | Supabase から代表窓の行を取得 |
| API | `app/api/insights/summary/route.ts` | `requireAuth` 準拠の集計 JSON |

## グラフライブラリの選定（R5）

**依存ゼロの SVG 手書き横棒**を採用（Recharts 不採用）。理由:
- 初回に必要なのは横棒のみで Recharts は過剰。
- Recharts 3 は React 19 で `react-is` の override と `"use client"` 境界が必須。SVG なら
  サーバーコンポーネントのまま静的レンダリングでき、依存も override も増やさない。
- 小 n の淡色化など表示制御を自前で細かく持てる。

## 認証

`/insights` ページは `middleware.ts` の保護パス（`isProtectedPath`）で保護。
API は `requireAuth()` に準拠。公開ブログ経路（`/asset`,`/tech`,`/health` 等）は保護対象に含めない。

## テスト

```bash
npx vitest run lib/insights app/api/insights "app/(admin)/insights" middleware.test.ts
```
