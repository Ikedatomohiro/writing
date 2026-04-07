-- sns_series: シリーズのメタ情報・ステータス管理
create table sns_series (
  id              uuid primary key default gen_random_uuid(),
  theme           text,
  pattern         text,
  quality_score   numeric(4,2),
  score_breakdown jsonb,
  status          text not null default 'draft',
  -- 値: draft / pending_approval / approved / queued
  queue_order     integer,
  is_posted       boolean not null default false,
  posted_at       timestamptz,
  approved_at     timestamptz,
  source          text default 'content-pipeline',
  source_draft_id text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create unique index sns_series_queue_order_unique
  on sns_series (queue_order)
  where status = 'queued';

create index sns_series_status_queue_idx on sns_series(status, queue_order);

-- sns_posts: 個別投稿（series_idで直接紐付け）
create table sns_posts (
  id              uuid primary key default gen_random_uuid(),
  series_id       uuid not null references sns_series(id) on delete cascade,
  position        integer not null default 0,
  -- 0 = 親投稿（1枚目）、1以降 = 子投稿（続き）
  text            text not null check (char_length(text) <= 500),
  type            text not null default 'normal',
  -- 値: normal / comment_hook / thread / affiliate
  threads_post_id text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (series_id, position)
);

create index sns_posts_series_idx on sns_posts(series_id);
