-- sns_series: Threads API の topic_tag を保持するカラムを追加
-- 背景: Meta Threads Graph API は投稿時に `topic_tag` パラメータを受け取り、
--       投稿のトピック分類として表示する。本文中の #ハッシュタグとは別レイヤ。
--       1 投稿に 1 つだけ指定可能。シリーズ（親投稿）に紐づけるため
--       sns_posts ではなく sns_series 側に持たせる。
--
-- API 仕様（公式 docs より、2026-04-29 取得）:
--   - 1〜50 文字
--   - 使用不可文字: ピリオド '.' / アンパサンド '&'
--   - 親投稿（reply_to_id 未指定）に対してのみ意味を持つ
--
-- 後方互換:
--   - NULL 許容。既存レコードは NULL のまま投稿経路で topic_tag パラメータを送らない。
--   - 新規 INSERT でも topic_tag 未指定なら NULL のまま。
--
-- 適用後の確認クエリ:
--   select account, topic_tag, count(*) from sns_series
--     group by account, topic_tag order by 1, 2;

alter table sns_series
  add column if not exists topic_tag text;

-- API 制約に揃えた DB 側のソフトガード（NULL 許容、空文字は不可、長さ・禁則文字をチェック）
-- writer / ingest 側でも同等の検証をかけるが、誤投入を最後段で弾く目的。
alter table sns_series
  add constraint sns_series_topic_tag_check
  check (
    topic_tag is null
    or (
      char_length(topic_tag) between 1 and 50
      and topic_tag !~ '[.&]'
    )
  );

-- account 別の topic_tag 利用状況を把握するためのインデックス（任意）
create index if not exists sns_series_account_topic_tag_idx
  on sns_series (account, topic_tag)
  where topic_tag is not null;
