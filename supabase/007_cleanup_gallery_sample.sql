-- ============================================
-- ギャラリー サンプルデータ削除
-- ※ main マージ前に実行
-- ============================================

-- 順序: 外部キー依存の逆順で削除
DELETE FROM public.image_saves;
DELETE FROM public.image_likes;
DELETE FROM public.image_reports;
DELETE FROM public.shared_images;
