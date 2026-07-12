-- sns_series / sns_metrics: 投稿の「幅出し由来」を Check 層まで貫通させる provenance 列を追加。
-- 背景: pao-pao-cho の Threads バッチを 8本（金融3 + IT3 + 新視点2）に再編するにあたり、
--       新視点2枠（幅出し枠）の効果を週次コンテンツPDCA が測定するには、投稿が
--       「核6本由来（origin=core）」か「新視点枠由来（origin=expansion）」かを
--       sns_metrics（read-model）まで識別子付きで届ける必要がある。
--       identifier が届かなければ family 別の効果測定（views/ER）が成立しない
--       （pao_threads_expansion_design_20260712_v2.md §0-1 / §5-2 / §7-5）。
--
-- 列の意味:
--   - origin       : 'core'（金融3:IT3=3:3 の枠内）| 'expansion'（新視点枠・比率外・8型免除）。
--                    既存レコード・未指定は NULL（＝旧バッチ / core 相当の後方互換）。
--   - theme_family : origin=expansion 投稿の「幅出し family」分類（健康/時短/暮らしの知恵 等）。
--                    既存 theme より広い探索クラスタ。family 単位の効果集計・多様性
--                    （Shannon エントロピー）の bucket 軸になる。core 投稿・未指定は NULL。
--
-- provenance 経路（narrative_anchor と同じ実績経路）:
--   writer→pool.json → ingest_to_supabase(sns_series) → sync_supabase_to_posts(history)
--     → sns_metrics_ingest(sns_metrics)
--   このマイグレーションは経路の両端（sns_series / sns_metrics）に列を用意する。
--
-- 後方互換（加法的変更のみ・既存列と既存データを壊さない）:
--   - 全列 NULL 許容。既存レコードは NULL のまま。
--   - 新規 INSERT でも未指定なら NULL（ingest 側に PGRST204 フォールバックあり）。
--   - origin/theme_family の fail-loud 強制（列欠落時に停止）は ingest 側の
--     REQUIRE_ORIGIN フラグで制御し、本マイグレーション適用・検証後にのみ ON にする。
--
-- 適用後の確認クエリ:
--   select origin, count(*) from sns_series where account = 'pao-pao-cho' group by origin;
--   select origin, theme_family, count(*) from sns_metrics
--     where account = 'pao-pao-cho' and platform = 'threads' group by origin, theme_family;

-- sns_series: 生成側の provenance 源泉
alter table sns_series
  add column if not exists origin text;

alter table sns_series
  add column if not exists theme_family text;

-- origin は 'core' | 'expansion' のみ許容（NULL は後方互換で許可）
alter table sns_series
  add constraint sns_series_origin_check
  check (origin is null or origin in ('core', 'expansion'));

-- theme_family のソフトガード（NULL 許容 / 空文字は不可 / 1〜64字）
alter table sns_series
  add constraint sns_series_theme_family_check
  check (
    theme_family is null
    or char_length(theme_family) between 1 and 64
  );

-- account × origin × family の集計を高速化するインデックス（expansion のみ）
create index if not exists sns_series_account_origin_family_idx
  on sns_series (account, origin, theme_family)
  where origin = 'expansion';

-- sns_metrics: Check 層（read-model）の最終ホップ。origin/family で bucket 化する。
alter table sns_metrics
  add column if not exists origin text;

alter table sns_metrics
  add column if not exists theme_family text;

-- family 粒度のローリング集計を高速化するインデックス
create index if not exists sns_metrics_account_origin_family_idx
  on sns_metrics (account, platform, origin, theme_family)
  where origin = 'expansion';
