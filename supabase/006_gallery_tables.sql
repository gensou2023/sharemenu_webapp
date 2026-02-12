-- 共有画像
CREATE TABLE public.shared_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id uuid NOT NULL REFERENCES public.generated_images(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'other',
  show_shop_name boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- いいね（1ユーザー1画像につき1回）
CREATE TABLE public.image_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_image_id uuid NOT NULL REFERENCES public.shared_images(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(shared_image_id, user_id)
);

-- 保存（1ユーザー1画像につき1回）
CREATE TABLE public.image_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_image_id uuid NOT NULL REFERENCES public.shared_images(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(shared_image_id, user_id)
);

-- 報告
CREATE TABLE public.image_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_image_id uuid NOT NULL REFERENCES public.shared_images(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (reason IN ('inappropriate', 'spam', 'other')),
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.shared_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_reports ENABLE ROW LEVEL SECURITY;

-- インデックス
CREATE INDEX idx_shared_images_category ON public.shared_images(category);
CREATE INDEX idx_shared_images_created_at ON public.shared_images(created_at DESC);
CREATE INDEX idx_shared_images_user_id ON public.shared_images(user_id);
CREATE INDEX idx_image_likes_shared_image_id ON public.image_likes(shared_image_id);
CREATE INDEX idx_image_likes_user_id ON public.image_likes(user_id);
CREATE INDEX idx_image_saves_shared_image_id ON public.image_saves(shared_image_id);
CREATE INDEX idx_image_saves_user_id ON public.image_saves(user_id);
