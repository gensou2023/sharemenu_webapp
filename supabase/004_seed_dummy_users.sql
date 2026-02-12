-- =============================================
-- MenuCraft AI - ユーザー管理動作確認用ダミーデータ
-- 003_add_deleted_at.sql の後に実行
-- =============================================

-- =============================================
-- 1. ダミーユーザー（5名: アクティブ3名 + 停止1名 + ヘビーユーザー1名）
-- パスワードはすべて「test1234」（プレーンテキスト → 初回ログイン時にハッシュ化）
-- =============================================

INSERT INTO public.users (id, email, name, role, password_hash, created_at, deleted_at)
VALUES
  ('a0000001-0000-0000-0000-000000000001', 'sato@example.com',   '佐藤花子',   'user', 'test1234', now() - interval '90 days', NULL),
  ('a0000001-0000-0000-0000-000000000002', 'suzuki@example.com', '鈴木太郎',   'user', 'test1234', now() - interval '60 days', NULL),
  ('a0000001-0000-0000-0000-000000000003', 'takahashi@example.com', '高橋美咲', 'user', 'test1234', now() - interval '45 days', NULL),
  ('a0000001-0000-0000-0000-000000000004', 'yamada@example.com', '山田健一',   'user', 'test1234', now() - interval '30 days', now() - interval '5 days'),
  ('a0000001-0000-0000-0000-000000000005', 'ito@example.com',    '伊藤めぐみ', 'user', 'test1234', now() - interval '120 days', NULL);

-- =============================================
-- 2. チャットセッション（各ユーザーに1〜4件）
-- =============================================

-- 佐藤花子: 2セッション（1完了 + 1進行中）
INSERT INTO public.chat_sessions (id, user_id, title, status, shop_name, category, created_at, updated_at)
VALUES
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'ランチメニュー作成', 'completed', 'カフェさくら', 'cafe', now() - interval '85 days', now() - interval '84 days'),
  ('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'ディナーメニュー作成', 'active', 'カフェさくら', 'cafe', now() - interval '10 days', now() - interval '2 days');

-- 鈴木太郎: 1セッション（完了）
INSERT INTO public.chat_sessions (id, user_id, title, status, shop_name, category, created_at, updated_at)
VALUES
  ('b0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000002', '居酒屋メニュー', 'completed', '居酒屋たろう', 'izakaya', now() - interval '50 days', now() - interval '48 days');

-- 高橋美咲: 1セッション（進行中）
INSERT INTO public.chat_sessions (id, user_id, title, status, shop_name, category, created_at, updated_at)
VALUES
  ('b0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000003', 'スイーツメニュー', 'active', 'パティスリーミサキ', 'sweets', now() - interval '20 days', now() - interval '1 day');

-- 山田健一（停止済み）: 1セッション（進行中のまま停止）
INSERT INTO public.chat_sessions (id, user_id, title, status, shop_name, category, created_at, updated_at)
VALUES
  ('b0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000004', 'ラーメンメニュー', 'active', 'らーめん山田', 'ramen', now() - interval '25 days', now() - interval '10 days');

-- 伊藤めぐみ（ヘビーユーザー）: 4セッション（3完了 + 1進行中）
INSERT INTO public.chat_sessions (id, user_id, title, status, shop_name, category, created_at, updated_at)
VALUES
  ('b0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000005', 'イタリアンランチ', 'completed', 'トラットリア伊藤', 'italian', now() - interval '110 days', now() - interval '108 days'),
  ('b0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000005', 'ディナーコース', 'completed', 'トラットリア伊藤', 'italian', now() - interval '80 days', now() - interval '78 days'),
  ('b0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000005', 'テイクアウトメニュー', 'completed', 'トラットリア伊藤', 'italian', now() - interval '40 days', now() - interval '38 days'),
  ('b0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000005', '季節限定メニュー', 'active', 'トラットリア伊藤', 'italian', now() - interval '5 days', now() - interval '1 day');

-- =============================================
-- 3. メッセージ（各セッション2〜6件）
-- =============================================

-- セッション1: カフェさくら ランチメニュー（6メッセージ）
INSERT INTO public.messages (session_id, role, content, created_at)
VALUES
  ('b0000001-0000-0000-0000-000000000001', 'user', 'カフェさくらのランチメニューを作りたいです', now() - interval '85 days'),
  ('b0000001-0000-0000-0000-000000000001', 'ai', 'カフェさくらさんのランチメニューですね！どんなデザインの方向性がお好みですか？', now() - interval '85 days' + interval '1 minute'),
  ('b0000001-0000-0000-0000-000000000001', 'user', 'ナチュラルな雰囲気でお願いします', now() - interval '85 days' + interval '2 minutes'),
  ('b0000001-0000-0000-0000-000000000001', 'ai', 'ナチュラルな雰囲気ですね。メニュー名と価格を教えてください。', now() - interval '85 days' + interval '3 minutes'),
  ('b0000001-0000-0000-0000-000000000001', 'user', 'サーモンサラダ 980円、パスタランチ 1200円です', now() - interval '85 days' + interval '5 minutes'),
  ('b0000001-0000-0000-0000-000000000001', 'ai', '素敵なメニューですね！構成案をお作りしました。', now() - interval '85 days' + interval '6 minutes');

-- セッション2: カフェさくら ディナー（3メッセージ）
INSERT INTO public.messages (session_id, role, content, created_at)
VALUES
  ('b0000001-0000-0000-0000-000000000002', 'user', 'ディナーメニューも作りたいです', now() - interval '10 days'),
  ('b0000001-0000-0000-0000-000000000002', 'ai', 'ディナーメニューですね！ランチと同じナチュラルな雰囲気にしますか？', now() - interval '10 days' + interval '1 minute'),
  ('b0000001-0000-0000-0000-000000000002', 'user', 'はい、統一感を出したいです', now() - interval '10 days' + interval '3 minutes');

-- セッション3: 居酒屋たろう（4メッセージ）
INSERT INTO public.messages (session_id, role, content, created_at)
VALUES
  ('b0000001-0000-0000-0000-000000000003', 'user', '居酒屋のメニューを作りたいです', now() - interval '50 days'),
  ('b0000001-0000-0000-0000-000000000003', 'ai', '居酒屋たろうさんですね！和モダンな感じはいかがですか？', now() - interval '50 days' + interval '1 minute'),
  ('b0000001-0000-0000-0000-000000000003', 'user', '和モダンでお願いします。焼き鳥盛り合わせ 1500円です', now() - interval '50 days' + interval '3 minutes'),
  ('b0000001-0000-0000-0000-000000000003', 'ai', '焼き鳥盛り合わせ、美味しそうですね！構成案をお作りしました。', now() - interval '50 days' + interval '4 minutes');

-- セッション4: パティスリーミサキ（2メッセージ）
INSERT INTO public.messages (session_id, role, content, created_at)
VALUES
  ('b0000001-0000-0000-0000-000000000004', 'user', 'スイーツメニューを作成したいです', now() - interval '20 days'),
  ('b0000001-0000-0000-0000-000000000004', 'ai', 'パティスリーミサキさんのスイーツメニューですね！どんな雰囲気がお好みですか？', now() - interval '20 days' + interval '1 minute');

-- セッション5: らーめん山田（3メッセージ）
INSERT INTO public.messages (session_id, role, content, created_at)
VALUES
  ('b0000001-0000-0000-0000-000000000005', 'user', 'ラーメン屋のメニューを作りたい', now() - interval '25 days'),
  ('b0000001-0000-0000-0000-000000000005', 'ai', 'らーめん山田さんですね！力強いデザインはいかがですか？', now() - interval '25 days' + interval '1 minute'),
  ('b0000001-0000-0000-0000-000000000005', 'user', 'はい、インパクトのあるデザインで', now() - interval '25 days' + interval '2 minutes');

-- セッション6〜9: 伊藤めぐみ（各3〜5メッセージ）
INSERT INTO public.messages (session_id, role, content, created_at)
VALUES
  ('b0000001-0000-0000-0000-000000000006', 'user', 'イタリアンランチのメニューを作りたいです', now() - interval '110 days'),
  ('b0000001-0000-0000-0000-000000000006', 'ai', 'トラットリア伊藤さんのランチメニューですね！', now() - interval '110 days' + interval '1 minute'),
  ('b0000001-0000-0000-0000-000000000006', 'user', 'マルゲリータ 1100円、カルボナーラ 1300円です', now() - interval '110 days' + interval '3 minutes'),
  ('b0000001-0000-0000-0000-000000000006', 'ai', '素敵なメニュー構成ですね！構成案をお作りしました。', now() - interval '110 days' + interval '4 minutes'),
  ('b0000001-0000-0000-0000-000000000007', 'user', 'ディナーコースのメニューを作成お願いします', now() - interval '80 days'),
  ('b0000001-0000-0000-0000-000000000007', 'ai', 'ディナーコースですね！コース内容を教えてください。', now() - interval '80 days' + interval '1 minute'),
  ('b0000001-0000-0000-0000-000000000007', 'user', '前菜・パスタ・メイン・デザートの4品コース 3800円です', now() - interval '80 days' + interval '3 minutes'),
  ('b0000001-0000-0000-0000-000000000007', 'ai', '本格的なコースですね！構成案をお作りしました。', now() - interval '80 days' + interval '4 minutes'),
  ('b0000001-0000-0000-0000-000000000008', 'user', 'テイクアウトメニューも作りたいです', now() - interval '40 days'),
  ('b0000001-0000-0000-0000-000000000008', 'ai', 'テイクアウトメニューですね！持ち帰り用のデザインにしましょう。', now() - interval '40 days' + interval '1 minute'),
  ('b0000001-0000-0000-0000-000000000008', 'user', 'ピザとパスタのセット 1500円です', now() - interval '40 days' + interval '2 minutes'),
  ('b0000001-0000-0000-0000-000000000009', 'user', '季節限定メニューを考えています', now() - interval '5 days'),
  ('b0000001-0000-0000-0000-000000000009', 'ai', '季節限定メニューですね！今の季節にぴったりな食材はありますか？', now() - interval '5 days' + interval '1 minute'),
  ('b0000001-0000-0000-0000-000000000009', 'user', '春野菜のパスタと桜エビのピザを考えています', now() - interval '5 days' + interval '3 minutes');

-- =============================================
-- 4. 生成画像（ダミーパス — 実画像なし、メタデータのみ）
-- =============================================

-- 佐藤花子: 2枚
INSERT INTO public.generated_images (id, session_id, user_id, storage_path, prompt, created_at)
VALUES
  ('c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'dummy/sato_lunch_01.png', 'Natural cafe lunch menu with salmon salad', now() - interval '84 days'),
  ('c0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'dummy/sato_lunch_02.png', 'Natural cafe lunch menu with pasta', now() - interval '84 days' + interval '5 minutes');

-- 鈴木太郎: 1枚
INSERT INTO public.generated_images (id, session_id, user_id, storage_path, prompt, created_at)
VALUES
  ('c0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000002', 'dummy/suzuki_izakaya_01.png', 'Japanese modern izakaya yakitori menu', now() - interval '48 days');

-- 高橋美咲: 1枚
INSERT INTO public.generated_images (id, session_id, user_id, storage_path, prompt, created_at)
VALUES
  ('c0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000003', 'dummy/takahashi_sweets_01.png', 'Elegant patisserie sweets menu', now() - interval '15 days');

-- 山田健一: 1枚
INSERT INTO public.generated_images (id, session_id, user_id, storage_path, prompt, created_at)
VALUES
  ('c0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000004', 'dummy/yamada_ramen_01.png', 'Bold ramen restaurant menu design', now() - interval '20 days');

-- 伊藤めぐみ: 6枚（ヘビーユーザー）
INSERT INTO public.generated_images (id, session_id, user_id, storage_path, prompt, created_at)
VALUES
  ('c0000001-0000-0000-0000-000000000006', 'b0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000005', 'dummy/ito_lunch_01.png', 'Italian trattoria lunch margherita', now() - interval '108 days'),
  ('c0000001-0000-0000-0000-000000000007', 'b0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000005', 'dummy/ito_lunch_02.png', 'Italian trattoria lunch carbonara', now() - interval '108 days' + interval '5 minutes'),
  ('c0000001-0000-0000-0000-000000000008', 'b0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000005', 'dummy/ito_dinner_01.png', 'Italian dinner course appetizer', now() - interval '78 days'),
  ('c0000001-0000-0000-0000-000000000009', 'b0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000005', 'dummy/ito_dinner_02.png', 'Italian dinner course main dish', now() - interval '78 days' + interval '5 minutes'),
  ('c0000001-0000-0000-0000-000000000010', 'b0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000005', 'dummy/ito_takeout_01.png', 'Italian takeout pizza and pasta set', now() - interval '38 days'),
  ('c0000001-0000-0000-0000-000000000011', 'b0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000005', 'dummy/ito_seasonal_01.png', 'Spring vegetable pasta and sakura shrimp pizza', now() - interval '2 days');

-- =============================================
-- 5. API利用ログ
-- =============================================

-- 佐藤花子: 8ログ
INSERT INTO public.api_usage_logs (user_id, session_id, api_type, model, tokens_in, tokens_out, duration_ms, status, created_at)
VALUES
  ('a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'chat', 'gemini-2.0-flash', 150, 200, 1200, 'success', now() - interval '85 days'),
  ('a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'chat', 'gemini-2.0-flash', 180, 250, 1500, 'success', now() - interval '85 days' + interval '3 minutes'),
  ('a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'chat', 'gemini-2.0-flash', 200, 300, 1800, 'success', now() - interval '85 days' + interval '6 minutes'),
  ('a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'image_gen', 'gemini-2.0-flash', 100, 0, 8000, 'success', now() - interval '84 days'),
  ('a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'image_gen', 'gemini-2.0-flash', 100, 0, 7500, 'success', now() - interval '84 days' + interval '5 minutes'),
  ('a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000002', 'chat', 'gemini-2.0-flash', 120, 180, 1100, 'success', now() - interval '10 days'),
  ('a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000002', 'chat', 'gemini-2.0-flash', 140, 200, 1300, 'success', now() - interval '10 days' + interval '1 minute'),
  ('a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000002', 'chat', 'gemini-2.0-flash', 160, 220, 1400, 'success', now() - interval '2 days');

-- 鈴木太郎: 4ログ
INSERT INTO public.api_usage_logs (user_id, session_id, api_type, model, tokens_in, tokens_out, duration_ms, status, created_at)
VALUES
  ('a0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000003', 'chat', 'gemini-2.0-flash', 130, 190, 1100, 'success', now() - interval '50 days'),
  ('a0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000003', 'chat', 'gemini-2.0-flash', 170, 240, 1400, 'success', now() - interval '50 days' + interval '3 minutes'),
  ('a0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000003', 'image_gen', 'gemini-2.0-flash', 100, 0, 9000, 'success', now() - interval '48 days'),
  ('a0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000003', 'chat', 'gemini-2.0-flash', 150, 200, 1200, 'error', now() - interval '49 days');

-- 高橋美咲: 3ログ
INSERT INTO public.api_usage_logs (user_id, session_id, api_type, model, tokens_in, tokens_out, duration_ms, status, created_at)
VALUES
  ('a0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000004', 'chat', 'gemini-2.0-flash', 110, 170, 1000, 'success', now() - interval '20 days'),
  ('a0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000004', 'image_gen', 'gemini-2.0-flash', 100, 0, 8500, 'success', now() - interval '15 days'),
  ('a0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000004', 'chat', 'gemini-2.0-flash', 140, 200, 1300, 'success', now() - interval '1 day');

-- 山田健一: 3ログ
INSERT INTO public.api_usage_logs (user_id, session_id, api_type, model, tokens_in, tokens_out, duration_ms, status, created_at)
VALUES
  ('a0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000005', 'chat', 'gemini-2.0-flash', 100, 150, 900, 'success', now() - interval '25 days'),
  ('a0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000005', 'chat', 'gemini-2.0-flash', 120, 180, 1100, 'success', now() - interval '25 days' + interval '1 minute'),
  ('a0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000005', 'image_gen', 'gemini-2.0-flash', 100, 0, 7800, 'success', now() - interval '20 days');

-- 伊藤めぐみ（ヘビーユーザー）: 18ログ
INSERT INTO public.api_usage_logs (user_id, session_id, api_type, model, tokens_in, tokens_out, duration_ms, status, created_at)
VALUES
  ('a0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000006', 'chat', 'gemini-2.0-flash', 150, 200, 1200, 'success', now() - interval '110 days'),
  ('a0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000006', 'chat', 'gemini-2.0-flash', 180, 250, 1500, 'success', now() - interval '110 days' + interval '3 minutes'),
  ('a0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000006', 'image_gen', 'gemini-2.0-flash', 100, 0, 8200, 'success', now() - interval '108 days'),
  ('a0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000006', 'image_gen', 'gemini-2.0-flash', 100, 0, 7900, 'success', now() - interval '108 days' + interval '5 minutes'),
  ('a0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000007', 'chat', 'gemini-2.0-flash', 160, 220, 1300, 'success', now() - interval '80 days'),
  ('a0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000007', 'chat', 'gemini-2.0-flash', 190, 270, 1600, 'success', now() - interval '80 days' + interval '3 minutes'),
  ('a0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000007', 'image_gen', 'gemini-2.0-flash', 100, 0, 8800, 'success', now() - interval '78 days'),
  ('a0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000007', 'image_gen', 'gemini-2.0-flash', 100, 0, 9200, 'success', now() - interval '78 days' + interval '5 minutes'),
  ('a0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000008', 'chat', 'gemini-2.0-flash', 140, 200, 1200, 'success', now() - interval '40 days'),
  ('a0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000008', 'chat', 'gemini-2.0-flash', 170, 230, 1400, 'success', now() - interval '40 days' + interval '2 minutes'),
  ('a0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000008', 'image_gen', 'gemini-2.0-flash', 100, 0, 8100, 'success', now() - interval '38 days'),
  ('a0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000009', 'chat', 'gemini-2.0-flash', 130, 190, 1100, 'success', now() - interval '5 days'),
  ('a0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000009', 'chat', 'gemini-2.0-flash', 155, 210, 1250, 'success', now() - interval '5 days' + interval '1 minute'),
  ('a0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000009', 'image_gen', 'gemini-2.0-flash', 100, 0, 7600, 'success', now() - interval '2 days'),
  ('a0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000009', 'chat', 'gemini-2.0-flash', 145, 205, 1150, 'success', now() - interval '3 days'),
  ('a0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000009', 'chat', 'gemini-2.0-flash', 135, 195, 1050, 'success', now() - interval '1 day'),
  ('a0000001-0000-0000-0000-000000000005', NULL, 'chat', 'gemini-2.0-flash', 100, 150, 900, 'error', now() - interval '70 days'),
  ('a0000001-0000-0000-0000-000000000005', NULL, 'image_gen', 'gemini-2.0-flash', 100, 0, 5000, 'error', now() - interval '50 days');
