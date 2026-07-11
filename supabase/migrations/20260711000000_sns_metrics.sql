-- sns_metrics: Threads/X 投稿のエンゲージメント指標を保持する read-model（一方向・冪等な派生プロジェクション）。
-- content-data の history/posts.json（Threads）・x_history/posts.json（X）から ingest 専用で流し込む。
-- 分析経路（run_analyst / x-analyst）はこのテーブルを読まないため、ローカル JSON と drift しても
-- 生成判断は汚染されない（第二の真実源にならない）。GUI（(admin)/insights）表示のみが読む。
--
-- プラットフォーム非対称の吸収:
--   Threads = (platform, post_id, metric_window) で metric_window ∈ {'1h','6h','24h'} の複数行（窓欠損は行を作らない。実データは現状 24h のみ）
--   X       = metric_window='latest' の単一行を upsert で上書き（伸びカーブは持たない）
create table sns_metrics (
  id            uuid primary key default gen_random_uuid(),
  platform      text not null,          -- 'threads' | 'x'
  account       text not null,          -- 'pao-pao-cho' 等
  post_id       text not null,          -- Threads: threads_post_id / X: id_str
  metric_window text not null,          -- Threads: '1h'|'6h'|'24h' / X: 'latest'（R1: 'window' は PostgreSQL 予約語のため metric_window）
  posted_at     timestamptz,            -- 投稿時刻（UTC 正規化）。時間帯別集計の軸。Threads=posted_at / X=tweet_created_at
  views         integer,
  likes         integer,                -- Threads likes / X favorite_count
  replies       integer,                -- Threads replies / X reply_count
  reposts       integer,                -- Threads reposts / X retweet_count
  quotes        integer,                -- Threads quotes / X quote_count
  saves         integer,                -- Threads saves / X bookmark_count
  fetched_at    timestamptz not null,   -- 指標取得時刻（UTC 正規化）。upsert で新しい方を採用する基準
  pattern       text,                   -- Threads の投稿パターン（history 由来）。X は null
  theme         text,                   -- Threads のテーマ（history 由来）。X は null
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (platform, post_id, metric_window)   -- 冪等 upsert キー
);

create index sns_metrics_account_platform_idx on sns_metrics(account, platform, metric_window);

-- RLS: anon 拒否。SERVICE_ROLE（server クライアント）経由のみ許可（ポリシー未定義＝デフォルト拒否を利用）。
alter table sns_metrics enable row level security;
