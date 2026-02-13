-- 012: 通知設定テーブル
-- 設定画面 通知設定 (#51) 対応

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,

  -- 通知種別
  new_features boolean NOT NULL DEFAULT true,
  generation_complete boolean NOT NULL DEFAULT true,
  gallery_reactions boolean NOT NULL DEFAULT true,
  marketing boolean NOT NULL DEFAULT false,

  -- メール受信頻度
  email_frequency text NOT NULL DEFAULT 'realtime'
    CHECK (email_frequency IN ('realtime', 'daily', 'weekly', 'off')),

  -- タイムスタンプ
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_prefs_user_id ON public.notification_preferences(user_id);

CREATE TRIGGER update_notification_prefs_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
