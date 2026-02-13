-- 010: ユーザー店舗プロフィール拡充カラム追加
-- 設定画面 #46 対応

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS avatar_url text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS business_type text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS shop_concept text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS brand_color_primary text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS brand_color_secondary text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS prefecture text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS website_url text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sns_instagram text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sns_x text DEFAULT NULL;

COMMENT ON COLUMN public.users.business_type IS '業態: izakaya/cafe/french/italian/japanese/chinese/ramen/yakiniku/other';
COMMENT ON COLUMN public.users.shop_concept IS '店舗コンセプト（200文字以内）';
COMMENT ON COLUMN public.users.brand_color_primary IS 'ブランドカラー（メイン）HEX値';
COMMENT ON COLUMN public.users.brand_color_secondary IS 'ブランドカラー（サブ）HEX値';
COMMENT ON COLUMN public.users.prefecture IS '都道府県';
COMMENT ON COLUMN public.users.website_url IS 'Webサイト URL';
COMMENT ON COLUMN public.users.sns_instagram IS 'Instagram ユーザー名';
COMMENT ON COLUMN public.users.sns_x IS 'X (Twitter) ユーザー名';
