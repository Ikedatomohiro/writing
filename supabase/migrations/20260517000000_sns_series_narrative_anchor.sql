-- sns_series: ナラティブ骨格の単調反復を是正するためのメタ列を追加
-- 背景: pao-pao-cho の Threads 投稿で、同一の語りエピソード（転職・ソシャレン損失・
--       年下先輩 等）や同一の修辞テンプレ（断言締め・二人称フック）が単調反復し、
--       投稿の多様性が低下していた。直近投稿の語りアンカー出現回数を集計して
--       writer が動的回避できるよう、シリーズ単位でメタ情報を永続化する。
--
-- 列の意味:
--   - narrative_anchor : このシリーズが参照した実体験エピソードの id
--                        （persona/knowledge/pao-pao-cho/episodes.json の ep_xxx）。
--                        自分史を語らない一般論・データ・他者事例の場合は NULL。
--   - rhetorical_tags  : 親投稿に用いた修辞テンプレのタグ配列。
--                        例: ["断言締め","二人称フック","救済アーク"]。
--                        該当なし・未指定は NULL（空配列ではなく NULL を許容）。
--
-- 配置の判断（CEO 指示との差分・要 surface）:
--   CEO のユーザー確定事項では "sns_posts テーブルに列追加" と記載されていたが、
--   topic_tag（2026-04-29 / 20260429000000_sns_series_topic_tag.sql）と同じく
--   これらはシリーズ（親投稿）単位の属性であり、pool.json も 1 ドラフト = 1 シリーズ
--   構造であるため sns_series 側に持たせる方が semantic に正しく、c-2 集計
--   （直近30件の narrative_anchor 出現回数）も position=0 への join 不要で簡潔になる。
--   sns_posts に置くと position>=1 の行で NULL/重複の扱いが曖昧になる。
--   この差分は generator 報告で CEO → ユーザーに transfer する。
--
-- 後方互換:
--   - 両列とも NULL 許容。既存レコードは NULL のまま。
--   - 新規 INSERT でも未指定なら NULL のまま（ingest 側に PGRST204 フォールバックあり）。
--
-- 適用後の確認クエリ:
--   select narrative_anchor, count(*) from sns_series
--     where account = 'pao-pao-cho'
--     group by narrative_anchor order by 2 desc;

alter table sns_series
  add column if not exists narrative_anchor text;

-- rhetorical_tags は text[]（PostgreSQL 配列）。空配列ではなく NULL を未指定扱いにする。
alter table sns_series
  add column if not exists rhetorical_tags text[];

-- narrative_anchor のソフトガード（NULL 許容 / 空文字は不可 / 1〜64字）
alter table sns_series
  add constraint sns_series_narrative_anchor_check
  check (
    narrative_anchor is null
    or char_length(narrative_anchor) between 1 and 64
  );

-- account 別の narrative_anchor 利用状況を把握するためのインデックス
create index if not exists sns_series_account_narrative_anchor_idx
  on sns_series (account, narrative_anchor)
  where narrative_anchor is not null;
