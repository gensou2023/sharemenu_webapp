-- ============================================
-- ギャラリー サンプルデータ投入
-- ※ 動作確認後に 007_cleanup_gallery_sample.sql で削除
-- ============================================

-- 既存の generated_images からランダムに shared_images を作成
-- (generated_images にデータがある前提)
INSERT INTO public.shared_images (image_id, user_id, category, show_shop_name, created_at)
SELECT
  gi.id,
  gi.user_id,
  CASE (ROW_NUMBER() OVER (ORDER BY gi.created_at)) % 6
    WHEN 0 THEN 'cafe'
    WHEN 1 THEN 'izakaya'
    WHEN 2 THEN 'italian'
    WHEN 3 THEN 'ramen'
    WHEN 4 THEN 'sweets'
    WHEN 5 THEN 'other'
  END,
  CASE WHEN (ROW_NUMBER() OVER (ORDER BY gi.created_at)) % 3 = 0 THEN true ELSE false END,
  gi.created_at + interval '1 hour'
FROM public.generated_images gi
WHERE NOT EXISTS (
  SELECT 1 FROM public.shared_images si WHERE si.image_id = gi.id
)
LIMIT 20;

-- いいねサンプル（各共有画像に1〜3件のいいね）
INSERT INTO public.image_likes (shared_image_id, user_id, created_at)
SELECT
  si.id,
  u.id,
  si.created_at + interval '2 hours'
FROM public.shared_images si
CROSS JOIN (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS rn
  FROM public.users
  WHERE deleted_at IS NULL
  LIMIT 5
) u
WHERE u.rn <= (1 + (abs(hashtext(si.id::text)) % 3))
  AND si.user_id != u.id
ON CONFLICT (shared_image_id, user_id) DO NOTHING;

-- 保存サンプル（一部の共有画像に保存）
INSERT INTO public.image_saves (shared_image_id, user_id, created_at)
SELECT
  si.id,
  u.id,
  si.created_at + interval '3 hours'
FROM public.shared_images si
CROSS JOIN (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS rn
  FROM public.users
  WHERE deleted_at IS NULL
  LIMIT 3
) u
WHERE u.rn <= (1 + (abs(hashtext(si.id::text || 'save')) % 2))
  AND si.user_id != u.id
ON CONFLICT (shared_image_id, user_id) DO NOTHING;
