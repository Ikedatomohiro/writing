-- sns_series: アカウント識別カラムを追加
-- 背景: morita_rin / matsumoto_sho の Threads 運用開始（2026-04-25）に伴い、
--       アカウント別の投稿キューを分離する必要が生じた。
--
-- 適用前の暫定対策: post_next_queued.py で source_draft_id の LIKE フィルタを使用。
-- このマイグレーション適用後: .eq("account", account) に切り替えること。
-- 参照: content-pipeline/threads-creator/scripts/post_next_queued.py の
--       get_next_queued_series() コメントを参照。
--
-- 既存挙動の互換: 既存の queue_order を持つ pao / rin の行はバックフィル済みのため、
--   account 別 UNIQUE 再構築でも衝突しない（rin: 2001..、pao: 1..30 帯で既に分離済み）。

-- 1. カラム追加（NOT NULL + DEFAULT 'pao-pao-cho'）
--    新規 INSERT で account を指定し忘れても既存運用と同じ挙動を維持する。
alter table sns_series
  add column if not exists account text not null default 'pao-pao-cho';

-- 2. 既存行をバックフィル
--    a. デフォルトで全行 'pao-pao-cho' に揃える（idempotent: 空文字 / null も含めて補正）
update sns_series
  set account = 'pao-pao-cho'
  where account is null or account = '';

--    b. source_draft_id のプレフィックス規約で morita_rin に再分類
update sns_series
  set account = 'morita_rin'
  where source_draft_id like 'draft_rin_%';

-- 3. 既存の queue_order UNIQUE インデックスを drop し、(account, queue_order) で再構築
--    既存スキーマでは sns_series_queue_order_unique はグローバルだったため、
--    account 別キュー独立化にあわせてスコープを変更する。
drop index if exists sns_series_queue_order_unique;
create unique index sns_series_queue_order_unique
  on sns_series (account, queue_order)
  where status = 'queued';

-- 4. account 検索用のインデックス
create index if not exists sns_series_account_idx on sns_series(account);

-- 適用後の確認クエリ:
-- select account, count(*) from sns_series group by account;
-- select account, status, count(*) from sns_series group by account, status order by 1, 2;
-- select account, queue_order from sns_series where status = 'queued' order by account, queue_order;
