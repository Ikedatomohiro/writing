# insights — SNS エンゲージメント解析

Threads / X を横断して投稿のエンゲージメントを可視化する管理画面（`/insights`）。
JSON を直接読まずに全体像とアカウント別・プラットフォーム別のエンゲージメントを掴むための経路。

## 表示モデル（重要・W-a）

**既定（フィルタ無し）の表示は「全アカウント・両プラットフォームを1つに混ぜたプール平均」**であり、
アカウントを横に並べた比較ビューではない。アカウント間・プラットフォーム間の比較は、上部の
フィルタチップ（アカウント / プラットフォーム）で1つずつ絞り込んで（ドリルダウンして）行う。

- 既定のプール平均は「どのアカウントが牽引したか」を平準化して消すため、意思決定にはフィルタで
  1アカウントずつ確認すること。画面上部にも同趣旨の注記を出している。
- per-account を横並置する比較ビューは初回スコープ外（将来拡張）。

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

### 「AI が方針検討に使える」の充足範囲（W-d）

初回で提供するのは `/api/insights/summary`（JSON で集計を返す・`requireAuth` の人間セッション前提）
という**契約の器まで**。実際の生成エージェント（run_analyst / x-analyst）は現状この API も `sns_metrics`
も読まず、従来のローカル JSON を使い続ける。**エージェントを Supabase 由来の集計へ配線するのは Phase 3**
（read-model の2週間安定運用をトリガーに着手）。初回はここが部分充足である点を明記する。

## データフロー

- 取得元テーブル: Supabase `sns_metrics`（`writing/supabase/migrations/20260711000000_sns_metrics.sql`）
- **代表窓への畳み込み（#578 F-1/W-b）**: 取得は窓で絞らず全窓を引き、`dedupeToRepresentative` が
  投稿ごと（`platform`+`account`+`post_id`）に代表窓 1 行へ畳む（Threads 24h>6h>1h / X latest）。
  これで views の二重加算を防ぎ（F-1）、24h が欠損し 1h/6h しか無い投稿も落とさない（W-b）。
- 取得は `PAGE_SIZE=500` でページング（Supabase 既定 max-rows 1000 と同値だと上限低下時に沈黙
  under-read するため安全マージン）。
- ingest スクリプト: `content-pipeline/threads-creator/scripts/`
  - `backfill_sns_metrics.py` — 全アカウント一括 backfill（冪等・`--dry-run` 可・件数検証付き）
- **日次自動同期（A）**: `run_sns_metrics_sync.sh` を launchd `com.contentmgmt.sns-metrics-sync`（毎日 10:00・fetcher 群の後）が実行し、content-data 履歴 → `sns_metrics` を同期。件数不一致時は Slack 通知。

## 表示のキャッシュ（B1）

`page.tsx` はデータ取得＋集計を `unstable_cache`（revalidate 3600秒）でキャッシュする。
`sns_metrics` は日次更新の低頻度データのため 1h の陳腐化は許容範囲。これで cold start と
毎訪問の全件フェッチを消す。認証は middleware がリクエスト毎に実行するのでキャッシュ対象外。
恒久スケール策（集計 view/RPC）は issue #578。

## 指標定義

2つの軸を明確に分けて表示する（C・体感ズレ対策）。**リーチ（views）を主役、率を補助**に配置する
（ユーザーの体感＝金融≫エンジニア≫HSP と第一印象を一致させるため。既定画面はまずリーチが目に入る）。

- **【主役】リーチ（views 合計）= どれだけ読まれたか**。テーマ別・アカウント別の views 合計を棒グラフで
  画面上部に表示。規模・到達の指標。「一番読まれたのは何か」はここで 3 秒で読める。
- **【補助】刺さり度（エンゲージメント率）= 見た人がどれだけ反応したか** = `(likes + replies + reposts + quotes + saves) / views`。
  **拡散力（リーチ）ではない**。`views=0` は率 = null（「—」）。パターン別/テーマ別（Threads のみ）・時間帯別（JST・両PF）。
  分析価値（morita 系の高エンゲージ発見など）があるため削除はせず、補助軸として残す。

> **重要**: リーチと刺さり度は**別軸で順位が逆転しうる**。例: 金融系はリーチ最大だが率は控えめ、
> HSP 系はリーチ小だが率は高い。**リーチが小さい投稿は率が 100% を超えることがある**（反応数が
> 表示回数を上回るため）。率チャートでは平均 views < `MIN_VIEWS_FOR_RATE`(=300) のカテゴリを
> 「低リーチ」として淡色表示し、率の過大評価を注意喚起する（除外はしない。低リーチ×高エンゲージは
> 実在の有効な信号のため）。

- **累計 views/likes・投稿数**（虚栄指標・従）

各カテゴリ集計には n（サンプル数）を併記。`n < MIN_SAMPLE_SIZE`（暫定 5）のカテゴリは
「参考値」として淡色表示する。閾値は `lib/insights/aggregate.ts` の `MIN_SAMPLE_SIZE` 1 箇所で変更する。

### X の率は bookmark を分子に含む（既存 x-analyst と定義が違う・W-c）

本ダッシュボードの X 率は分母 views・分子に `saves`（＝X の `bookmark_count`）を**含む**
（Threads の `saves` と対称にし、Threads↔X を同じ「保存」を含む定義で横断比較できるようにするため）。
一方、既存の `content-pipeline/x-creator/.claude/agents/analyst.md` の X 率は
`(favorite+retweet+reply+quote)/views` で **bookmark を含まない**。

したがって**この画面の X 数値は `x_analysis/latest.json` の数値と一致しない**（bookmark ぶん高く出る）。
これは意図的な差異（横断比較の内部整合を優先）。将来どちらかに統一する場合は
`lib/insights/aggregate.ts` の `engagementRate` と adapter（`sns_metrics_ingest.py` の `saves←bookmark_count`）を揃える。

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
