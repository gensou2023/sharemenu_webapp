-- リリースノートテーブル
CREATE TABLE public.release_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'feature' CHECK (category IN ('feature', 'bugfix', 'improvement')),
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_release_notes_published ON public.release_notes(is_published, published_at DESC);
