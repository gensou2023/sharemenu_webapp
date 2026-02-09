-- =============================================
-- MenuCraft AI - Database Schema
-- Supabase SQL Editor にコピー&ペーストして実行
-- =============================================

-- 1. uuid生成用の拡張を有効化
create extension if not exists "pgcrypto";

-- =============================================
-- 2. テーブル作成
-- =============================================

-- users テーブル
create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- chat_sessions テーブル
create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null default '新規セッション',
  status text not null default 'active' check (status in ('active', 'completed')),
  shop_name text,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- messages テーブル
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'ai')),
  content text not null,
  proposal_json jsonb,
  created_at timestamptz not null default now()
);

-- generated_images テーブル
create table public.generated_images (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  storage_path text not null,
  prompt text not null,
  aspect_ratio text not null default '1:1',
  proposal_json jsonb,
  created_at timestamptz not null default now()
);

-- prompt_templates テーブル
create table public.prompt_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  content text not null,
  version int not null default 1,
  is_active boolean not null default true,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- reference_images テーブル
create table public.reference_images (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  label text not null,
  category text not null default 'general',
  uploaded_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- api_usage_logs テーブル
create table public.api_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  session_id uuid references public.chat_sessions(id) on delete set null,
  api_type text not null check (api_type in ('chat', 'image_gen')),
  model text not null,
  tokens_in int,
  tokens_out int,
  duration_ms int,
  status text not null default 'success' check (status in ('success', 'error')),
  error_message text,
  created_at timestamptz not null default now()
);

-- =============================================
-- 3. インデックス
-- =============================================

create index idx_chat_sessions_user_id on public.chat_sessions(user_id);
create index idx_chat_sessions_updated_at on public.chat_sessions(updated_at desc);
create index idx_messages_session_id on public.messages(session_id);
create index idx_messages_created_at on public.messages(created_at);
create index idx_generated_images_session_id on public.generated_images(session_id);
create index idx_generated_images_user_id on public.generated_images(user_id);
create index idx_api_usage_logs_user_id on public.api_usage_logs(user_id);
create index idx_api_usage_logs_created_at on public.api_usage_logs(created_at desc);
create index idx_prompt_templates_active on public.prompt_templates(name, is_active) where is_active = true;

-- =============================================
-- 4. updated_at 自動更新トリガー
-- =============================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_users
  before update on public.users
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_chat_sessions
  before update on public.chat_sessions
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_prompt_templates
  before update on public.prompt_templates
  for each row execute function public.handle_updated_at();

-- =============================================
-- 5. Row Level Security (RLS)
-- =============================================

alter table public.users enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.messages enable row level security;
alter table public.generated_images enable row level security;
alter table public.prompt_templates enable row level security;
alter table public.reference_images enable row level security;
alter table public.api_usage_logs enable row level security;

-- サーバーサイド（service_role key）からは全テーブルにフルアクセス可能
-- クライアント（anon key）からの直接アクセスは基本的にブロック
-- 全てのDB操作はAPIルート経由で行うため、RLSはシンプルに保つ

-- service_role はデフォルトでRLSをバイパスするため、
-- anon keyでの直接アクセスを防ぐポリシーのみ設定
-- （Next.js APIルートからservice_role keyで操作する設計）

-- =============================================
-- 6. Storage バケット作成
-- =============================================

-- Supabase Dashboard の Storage から手動で作成するか、
-- 以下のSQLで作成（Supabase SQL Editorで実行）

insert into storage.buckets (id, name, public)
values
  ('generated', 'generated', true),
  ('references', 'references', true),
  ('uploads', 'uploads', false);

-- Storage ポリシー: service_role経由のみ許可（APIルートから操作）
-- publicバケットは読み取りのみ全員に許可
create policy "Public read for generated images"
  on storage.objects for select
  using (bucket_id = 'generated');

create policy "Public read for reference images"
  on storage.objects for select
  using (bucket_id = 'references');
