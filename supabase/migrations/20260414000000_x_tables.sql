-- X（Twitter）投稿管理用テーブル
-- sns_series / sns_posts は Threads 専用として残し、X は独立テーブルで管理する。
-- 投稿構造が異なる（Threadsはスレッドチェーン、Xは単一投稿前提）ため別テーブル化。

-- x_series: X投稿シリーズのメタ情報・ステータス管理
create table x_series (
  id              uuid primary key default gen_random_uuid(),
  account         text not null,
  -- アカウント識別子（ACTIVE_ACCOUNT と同じ値、例: 'pao-pao-cho' / 'matsumoto_sho'）
  theme           text,
  category        text,
  -- X 独自の4カテゴリ: 'note_article' / 'tech_tips' / 'career' / 'opinion'
  quality_score   numeric(4,2),
  score_breakdown jsonb,
  status          text not null default 'draft',
  -- 値: draft / queued / posting / posted / rejected
  queue_order     integer,
  is_posted       boolean not null default false,
  posted_at       timestamptz,
  source          text default 'content-pipeline',
  source_draft_id text,
  note_url        text,
  -- note_article カテゴリで参照した note 記事URL
  hashtags        jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- account × queue_order の同時ユニーク（queue中のみ）
create unique index x_series_queue_order_unique
  on x_series (account, queue_order)
  where status = 'queued';

create index x_series_account_status_idx on x_series(account, status, queue_order);

-- x_posts: X投稿本体（X は単一投稿前提だが、将来のスレッド対応を見越して series 構造を踏襲）
create table x_posts (
  id              uuid primary key default gen_random_uuid(),
  series_id       uuid not null references x_series(id) on delete cascade,
  position        integer not null default 0,
  text            text not null check (char_length(text) <= 280),
  -- X の文字数上限 280 を DB 制約で強制
  x_post_id       text,
  -- 投稿成功後の X (Twitter) 投稿 ID
  source_url      text,
  -- tech_tips カテゴリで参照した一次情報URL
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (series_id, position)
);

create index x_posts_series_idx on x_posts(series_id);
