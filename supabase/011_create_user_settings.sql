-- 011: ユーザー設定テーブル（画像生成デフォルト等）
-- 設定画面 S-02 対応

CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,

  -- 画像生成デフォルト (S-02)
  default_sizes text[] NOT NULL DEFAULT ARRAY['1:1'],
  default_style text DEFAULT NULL,
  default_text_language text NOT NULL DEFAULT 'ja',
  default_photo_style text DEFAULT NULL,

  -- 表示設定 (S-06) — 将来用
  theme text NOT NULL DEFAULT 'system' CHECK (theme IN ('system', 'light', 'dark')),
  reduce_animations boolean NOT NULL DEFAULT false,
  ui_language text NOT NULL DEFAULT 'ja',

  -- プライバシー (S-07) — 将来用
  ai_data_usage boolean NOT NULL DEFAULT true,
  gallery_show_shop_name boolean NOT NULL DEFAULT true,
  analytics_data_sharing boolean NOT NULL DEFAULT true,

  -- タイムスタンプ
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- 更新トリガー
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
