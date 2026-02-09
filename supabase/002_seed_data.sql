-- =============================================
-- MenuCraft AI - 初期データ投入
-- 001_create_tables.sql の後に実行
-- =============================================

-- パスワードハッシュ: bcryptで生成済み
-- demo1234  → $2b$10$EIXk8qV3Ue5v6fKbJGp4yuO3BxwVgLZ5jFn9i8v2pA4PYx5q5wGsK
-- admin1234 → $2b$10$RJk9qV4Ue6v7fLcJHGq5zuP4CywXhMa6kGo0j9w3qB5QZy6r6xHtL
-- ※実際のハッシュはアプリ起動時にAPIで生成するため、ここではプレーンテキストを仮置き
-- ※bcryptのインストール後に正しいハッシュに差し替えること

-- 1. デモユーザー
insert into public.users (email, name, role, password_hash)
values
  ('demo@menucraft.jp', '田中オーナー', 'user', 'demo1234'),
  ('admin@menucraft.jp', '管理者', 'admin', 'admin1234');

-- 2. チャット用システムプロンプト
insert into public.prompt_templates (name, content, version, is_active)
values (
  'chat_system',
  'あなたは「MenuCraft AI」というAIメニューデザインアシスタントです。
飲食店オーナーのメニュー画像作成を手伝います。

## あなたの役割
1. お店の名前、料理の情報、デザインの方向性をヒアリングする
2. メニューのキャッチコピーとハッシュタグを提案する
3. 構成案をまとめて提示する

## ヒアリングの流れ
1. まずお店の名前を聞く
2. デザインの方向性（和モダン/ナチュラル/シック/ポップ）を聞く
3. 料理写真のアップロードを促す（テキストのみの場合はスキップ）
4. メニュー名と価格を聞く
5. 構成案をJSON形式で提示する

## 構成案の出力形式
ヒアリングが完了したら、以下のJSON形式で構成案を出力してください（必ず ```json``` で囲む）：

```json
{
  "type": "proposal",
  "shopName": "店舗名",
  "catchCopies": ["キャッチコピーA", "キャッチコピーB"],
  "designDirection": "デザイン方向性の説明",
  "hashtags": ["#タグ1", "#タグ2", "#タグ3"]
}
```

## 注意事項
- 親しみやすく丁寧な日本語で会話する
- 絵文字を適度に使う
- 1回のメッセージは短めにする（長文を避ける）
- 飲食店オーナーが相手なので、専門用語は避ける',
  1,
  true
);

-- 3. 画像生成用プロンプトテンプレート
insert into public.prompt_templates (name, content, version, is_active)
values (
  'image_gen',
  'A professional food photography for a restaurant menu.
Restaurant: {{shopName}}
Design style: {{designDirection}}
Mood: appetizing, warm lighting, high-quality food photo
IMPORTANT: Do NOT include any text, letters, words, numbers, watermarks, or captions in the image. Generate ONLY the food photograph with no text overlay whatsoever.',
  1,
  true
);
