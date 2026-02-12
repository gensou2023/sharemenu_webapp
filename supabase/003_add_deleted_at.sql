ALTER TABLE public.users ADD COLUMN deleted_at timestamptz DEFAULT NULL;
CREATE INDEX idx_users_deleted_at ON public.users(deleted_at) WHERE deleted_at IS NULL;
