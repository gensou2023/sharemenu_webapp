-- 015: users テーブルに plan カラム追加（マネタイズ案B）
-- Free: 10枚/月, Pro: ¥700/月 50枚/月, Business: 将来拡張用

ALTER TABLE public.users
  ADD COLUMN plan TEXT NOT NULL DEFAULT 'free'
  CHECK (plan IN ('free', 'pro', 'business'));

-- plan カラムにインデックス追加（Admin revenue 等で使用）
CREATE INDEX idx_users_plan ON public.users(plan);
