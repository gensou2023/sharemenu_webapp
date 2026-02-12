-- バッジ定義テーブル
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  is_hidden boolean NOT NULL DEFAULT false,
  threshold jsonb NOT NULL DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ユーザーの獲得バッジ
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  notified boolean NOT NULL DEFAULT false,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);

-- ========================================
-- 表示バッジ 8個
-- ========================================
INSERT INTO public.achievements (key, name, description, icon, is_hidden, threshold, sort_order) VALUES
('first_image',      'はじめての一枚',     '最初のメニュー画像を生成',                    '🎨', false, '{"type":"image_count","value":1}', 1),
('image_master',     '画像マスター',       'メニュー画像を10枚生成',                      '🏆', false, '{"type":"image_count","value":10}', 2),
('chat_lover',       'おしゃべり好き',     'AIと50回メッセージをやり取り',                  '💬', false, '{"type":"message_count","value":50}', 3),
('session_pro',      'セッションプロ',     '5つのセッションを完了',                        '⭐', false, '{"type":"session_completed","value":5}', 4),
('first_share',      'シェアデビュー',     '初めてギャラリーに画像を共有',                  '🌟', false, '{"type":"share_count","value":1}', 5),
('popular',          'みんなの人気者',     '合計10いいねを獲得',                           '❤️', false, '{"type":"total_likes_received","value":10}', 6),
('collector',        'コレクター',         'ギャラリーから3枚の画像を保存',                 '📚', false, '{"type":"save_count","value":3}', 7),
('regular',          '常連さん',           '5日以上サービスを利用',                         '🏠', false, '{"type":"login_days","value":5}', 8);

-- ========================================
-- 非表示バッジ 8個（サプライズ）
-- ========================================
INSERT INTO public.achievements (key, name, description, icon, is_hidden, threshold, sort_order) VALUES
('speed_creator',    'スピードクリエイター', '登録24時間以内に3枚生成',                     '⚡', true, '{"type":"signup_hours_images","hours":24,"images":3}', 9),
('early_bird',       '早起きデザイナー',    '朝6時前に画像を生成',                          '🌅', true, '{"type":"hour_before","value":6}', 10),
('night_owl',        '夜更かしクリエイター', '深夜0時以降に画像を生成',                      '🦉', true, '{"type":"hour_after","value":0}', 11),
('minimalist',       'ミニマリスト',        '3メッセージ以内で画像生成',                     '✨', true, '{"type":"session_messages_lte","value":3}', 12),
('perfectionist',    'こだわりの人',        '同一セッションで5回以上再生成',                  '🔄', true, '{"type":"session_regenerate_gte","value":5}', 13),
('multi_genre',      'マルチジャンル',      '3種類以上のカテゴリで画像生成',                  '🎭', true, '{"type":"category_count","value":3}', 14),
('beloved',          '愛される作品',        '1枚の画像に5いいね',                            '💎', true, '{"type":"single_image_likes","value":5}', 15),
('image_legend',     '伝説の100枚',        'メニュー画像を100枚生成',                       '👑', true, '{"type":"image_count","value":100}', 16);
