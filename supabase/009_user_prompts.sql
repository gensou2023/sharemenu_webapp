CREATE TABLE public.user_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  prompt_text text NOT NULL,
  category text,
  usage_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_prompts_user_id ON public.user_prompts(user_id);

ALTER TABLE public.user_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_prompts_read" ON public.user_prompts FOR SELECT USING (true);
CREATE POLICY "user_prompts_insert" ON public.user_prompts FOR INSERT WITH CHECK (true);
CREATE POLICY "user_prompts_update" ON public.user_prompts FOR UPDATE USING (true);
CREATE POLICY "user_prompts_delete" ON public.user_prompts FOR DELETE USING (true);
