# MenuCraft AI — Phase 2 機能要件書

**作成日**: 2026-02-12
**ステータス**: ドラフト v1.0
**対象フェーズ**: Phase 2（エンゲージメント・コミュニティ強化）

---

## 概要

Phase 1（MVP）で確立した「対話型メニュー画像生成」の基盤の上に、ユーザーの定着・継続利用・課金転換を促進する4機能を追加する。

### 実装順序とスケジュール目安

| Phase | 機能 | 優先度 | 目的 |
|-------|------|--------|------|
| 2-1 | オンボーディング | 最高 | 初回体験の最適化 → 離脱率低減 |
| 2-2 | ギャラリー共有 | 高 | UGC によるサービスの広がり + 集客導線 |
| 2-3 | アチーブメント | 中 | 継続率向上 + ギャラリーとの相乗効果 |
| 2-4 | プロンプトモード | 中 | Pro プランの差別化 + パワーユーザー対応 |

### ユーザー体験サイクル

```
オンボーディング → 画像生成を楽しむ → アチーブメントで達成感
       ↓                                       ↓
  ギャラリーで他の作品を見る    ←    共有して承認を得る
       ↓
  保存した画像を参考に次の生成 → プロンプトモードで効率化
```

---

## F-20: オンボーディング

### 目的
初回登録ユーザーが迷わず最初の画像生成まで到達できるようにする。

### 発火条件
- 初回ログイン後、ダッシュボード到達時に自動表示
- 1回のみ表示（完了/スキップ後は再表示しない）
- `users.onboarding_completed_at` が `NULL` の場合に表示

### フロー

```
[Step 1] ようこそ画面
  「MenuCraft AI へようこそ！」
  サービス紹介（1文）+ イラスト
  → 「次へ」「スキップ」

[Step 2] チャット機能の紹介
  ダッシュボードの「新しいメニューを作成」ボタンをスポットライト
  「AIとチャットするだけで、メニュー画像が作れます」
  → 「次へ」「スキップ」

[Step 3] 対話フローの説明
  「お店の名前 → デザインの方向性 → メニュー情報を伝えると完成！」
  3ステップのミニイラスト
  → 「次へ」「スキップ」

[Step 4] CTA
  「さっそく始めてみましょう！」
  → 「チャットを始める」ボタン（/chat へ遷移）
  → 「あとで始める」（ダッシュボードに戻る）
```

### UI仕様
- オーバーレイ: 画面全体を半透明の黒で覆い、対象要素のみスポットライト表示
- カード: 中央配置、最大幅 480px、角丸20px
- プログレス: ドットインジケーター（1/4, 2/4...）
- アニメーション: fadeInUp でカード表示

### DB変更
```sql
ALTER TABLE public.users ADD COLUMN onboarding_completed_at timestamptz DEFAULT NULL;
```

### 変更ファイル（想定）
| ファイル | 区分 | 内容 |
|---------|------|------|
| `supabase/005_add_onboarding.sql` | 新規 | カラム追加 |
| `src/components/onboarding/OnboardingTour.tsx` | 新規 | ツアーコンポーネント |
| `src/app/dashboard/page.tsx` | 修正 | ツアー条件付きレンダリング |
| `src/app/api/account/route.ts` | 修正 | onboarding_completed_at 更新API |

---

## F-21: ギャラリー共有

### 目的
ユーザーが生成したメニュー画像を他のユーザーと共有し、コミュニティの活性化と新規ユーザーの集客導線を作る。

### ページ構成

#### `/gallery` — ギャラリー一覧ページ（未ログインでも閲覧可能）

```
┌─────────────────────────────────────────────┐
│ Header                                       │
├─────────────────────────────────────────────┤
│ ギャラリー                                    │
│ [すべて] [カフェ] [居酒屋] [イタリアン] [...]  │  ← カテゴリタブ
│ ソート: [新着 ▼] [いいね順] [保存順]           │
├─────────────────────────────────────────────┤
│ ┌───────┐ ┌───────┐ ┌───────┐               │
│ │ 画像  │ │ 画像  │ │ 画像  │               │  ← 2〜3カラムグリッド
│ │ ❤️ 12 │ │ ❤️ 8  │ │ ❤️ 3  │               │
│ │ 📌 5  │ │ 📌 2  │ │ 📌 1  │               │
│ │ カフェ │ │ 居酒屋│ │ イタリアン│             │
│ └───────┘ └───────┘ └───────┘               │
│                                              │
│ ┌───────┐ ┌───────┐ ...                     │  ← 10件/ページ
│                                              │
│         [< 前へ] 1/5 [次へ >]                │  ← ページネーション
└─────────────────────────────────────────────┘
```

#### 画像カード構成
- サムネイル画像
- いいね数 + いいねボタン（ログインユーザーのみ操作可能）
- 保存数 + 保存ボタン（ログインユーザーのみ操作可能）
- カテゴリバッジ
- 店名（ユーザーが許可した場合のみ表示）
- 共有日時

### 共有フロー

```
ダッシュボード or チャットのプレビューパネル
  → 「ギャラリーに共有」ボタン
  → 共有確認モーダル
      - プレビュー画像
      - カテゴリ（セッションから自動入力、変更可能）
      - 「店名を表示する」チェックボックス（デフォルトOFF）
  → 確認 → ギャラリーに公開
```

### いいね / 保存

| 操作 | 対象 | 条件 |
|------|------|------|
| いいね | ログインユーザー | 制限なし（1画像につき1回） |
| 保存 | ログインユーザー | Free: 3枚まで / Pro: 5枚まで |
| 閲覧 | 全ユーザー | ログイン不要 |

### 保存画像の参考画像連携
- チャット開始時（Step 1: 店名入力後）に「保存した画像を参考にしますか？」と提案
- ユーザーが選択 → 選択画像を Gemini に参考画像として送信
- 保存枚数 = 参考画像として使用可能な枚数（シンプルに統一）

### ソート / フィルター
| 機能 | 仕様 |
|------|------|
| カテゴリフィルター | タブ切り替え（すべて / cafe / izakaya / italian / sweets / ramen / その他） |
| ソート | 新着（デフォルト）/ いいね数順 / 保存数順 |
| ページネーション | 10件/ページ |

### モデレーション
- 各画像カードに「報告する」メニュー（三点リーダーから）
- 報告理由: 不適切な画像 / スパム / その他
- 報告は `image_reports` テーブルに保存 → 管理画面で確認

### DB設計

```sql
-- 共有画像
CREATE TABLE public.shared_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id uuid NOT NULL REFERENCES public.generated_images(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'other',
  show_shop_name boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- いいね
CREATE TABLE public.image_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_image_id uuid NOT NULL REFERENCES public.shared_images(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(shared_image_id, user_id)
);

-- 保存
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

-- インデックス
CREATE INDEX idx_shared_images_category ON public.shared_images(category);
CREATE INDEX idx_shared_images_created_at ON public.shared_images(created_at DESC);
CREATE INDEX idx_image_likes_shared_image_id ON public.image_likes(shared_image_id);
CREATE INDEX idx_image_saves_shared_image_id ON public.image_saves(shared_image_id);
```

### API エンドポイント

| パス | メソッド | 認証 | 機能 |
|------|---------|------|------|
| `/api/gallery` | GET | 不要 | 一覧取得（カテゴリ・ソート・ページネーション） |
| `/api/gallery` | POST | 必要 | 画像を共有 |
| `/api/gallery/[id]/like` | POST | 必要 | いいねトグル |
| `/api/gallery/[id]/save` | POST | 必要 | 保存トグル（枚数制限チェック） |
| `/api/gallery/[id]/report` | POST | 必要 | 報告 |
| `/api/gallery/saves` | GET | 必要 | 自分の保存画像一覧 |

### 変更ファイル（想定）

| ファイル | 区分 | 内容 |
|---------|------|------|
| `supabase/006_gallery_tables.sql` | 新規 | テーブル4つ + インデックス |
| `src/app/gallery/page.tsx` | 新規 | ギャラリー一覧ページ |
| `src/app/api/gallery/route.ts` | 新規 | 一覧取得 + 共有API |
| `src/app/api/gallery/[id]/like/route.ts` | 新規 | いいねAPI |
| `src/app/api/gallery/[id]/save/route.ts` | 新規 | 保存API |
| `src/app/api/gallery/[id]/report/route.ts` | 新規 | 報告API |
| `src/app/api/gallery/saves/route.ts` | 新規 | 自分の保存一覧API |
| `src/components/gallery/GalleryCard.tsx` | 新規 | 画像カードコンポーネント |
| `src/components/gallery/ShareModal.tsx` | 新規 | 共有確認モーダル |
| `src/components/landing/Header.tsx` | 修正 | ナビに「ギャラリー」追加 |
| `src/app/dashboard/page.tsx` | 修正 | 「共有」ボタン + 保存画像セクション |
| `src/components/chat/PreviewPanel.tsx` | 修正 | 「ギャラリーに共有」ボタン追加 |
| `src/middleware.ts` | 修正 | `/gallery` は認証不要を確認 |

### プラン制限

| | Free | Pro |
|---|------|-----|
| 共有 | 無制限 | 無制限 |
| いいね | 無制限 | 無制限 |
| 保存（参考画像として使用可能） | 3枚まで | 5枚まで |

---

## F-22: アチーブメント / ゲーミフィケーション

### 目的
小さな達成感を積み重ねることで継続利用を促進し、ギャラリー共有との相乗効果で課金転換率を高める。

### バッジ体系

#### 表示バッジ（8個）— ダッシュボードに常時表示

ユーザーが「次は何を目指せばいいか」分かるもの。未獲得はグレー+ロック表示。

| # | Key | アイコン | 名前 | 条件 | 意図 |
|---|-----|---------|------|------|------|
| 1 | `first_image` | 🎨 | はじめての一枚 | 画像を1枚生成 | 最初のハードルを超えた達成感 |
| 2 | `creator` | 🔥 | クリエイター | 画像を5枚生成 | 継続利用の動機づけ |
| 3 | `master_chef` | ⭐ | マスターシェフ | 画像を20枚生成 | ヘビーユーザーへの道 |
| 4 | `chatterbox` | 💬 | おしゃべり上手 | チャット50メッセージ送信 | 対話を楽しむ姿勢を評価 |
| 5 | `first_share` | 📤 | はじめてのシェア | ギャラリーに1枚共有 | 共有機能への誘導 |
| 6 | `popular` | ❤️ | 人気クリエイター | いいねを合計10個もらう | 共有のモチベーション |
| 7 | `completionist` | 🏆 | コンプリート | セッションを5回完了 | 最後まで作り切る習慣 |
| 8 | `regular` | 📅 | 常連さん | 累計7日間ログイン | 定着・再訪促進 |

#### 非表示バッジ（8個）— 獲得時にサプライズ通知、獲得後に表示

「こんなのあったんだ！」という驚きを演出。

| # | Key | アイコン | 名前 | 条件 | 意図 |
|---|-----|---------|------|------|------|
| 1 | `early_bird` | 🌅 | 早起きシェフ | 朝6時前に画像を生成 | 時間帯の遊び要素 |
| 2 | `night_owl` | 🌙 | 夜のメニュー会議 | 深夜0時以降に画像を生成 | 同上 |
| 3 | `one_shot` | 🎯 | 一発OK | 3メッセージ以内で画像生成完了 | 手際の良さ |
| 4 | `perfectionist` | 🔄 | こだわりの一枚 | 同一セッションで画像3回以上再生成 | 試行錯誤を肯定 |
| 5 | `collector` | 🗂 | コレクター | 他ユーザーの画像を3枚保存 | ギャラリー回遊促進 |
| 6 | `beloved` | 🤝 | 愛されメニュー | 1枚の画像にいいね5個 | 質の高い共有を評価 |
| 7 | `multi_genre` | 🎭 | マルチジャンル | 3種類以上のカテゴリでセッション作成 | 幅広い活用を促す |
| 8 | `speed_runner` | 🚀 | スピードスター | 登録24時間以内に画像3枚生成 | 初期エンゲージメント |

### 通知の仕組み

| 場所 | 表示タイミング | 演出 |
|------|-------------|------|
| チャット内 | 条件達成時、AIの次の応答に自然に組み込む | 「5枚目の画像ですね！🔥 クリエイターバッジを獲得しました！」 |
| トースト通知 | 条件達成の瞬間 | 画面上部に3秒間表示（アイコン + バッジ名 + おめでとうメッセージ） |
| ダッシュボード | 未読バッジがある場合 | バッジセクションに通知ドット表示 |

### ダッシュボード表示

```
┌─────────────────────────────────────┐
│ アチーブメント                        │
│                                      │
│ 🎨  🔥  ⭐  💬  📤  ❤️  🏆  📅     │  ← 表示バッジ（獲得=カラー / 未獲得=グレー）
│                                      │
│ + 非表示バッジ 2/8 獲得              │  ← 獲得した非表示バッジのみ表示
│ 🌅  🎯                              │
│                                      │
│ ホバー → ツールチップ（名前+条件）    │
└─────────────────────────────────────┘
```

### バッジ判定ロジック
- 画像生成・メッセージ送信・セッション完了の各API処理完了後にバックグラウンドで判定
- 判定結果を `user_achievements` に INSERT（既に存在する場合はスキップ）
- フロントエンドは `/api/achievements` から最新状態を取得

### デザイン方針
- 現在の MenuCraft のトーン（warm/gold/olive）に合わせ、ゲーム的になりすぎない品のあるデザイン
- 獲得バッジ: `accent-gold` の枠線 + 軽い光彩
- 未獲得バッジ: グレースケール + ロックアイコンオーバーレイ
- 非表示バッジ: 獲得前は存在自体を見せない

### DB設計

```sql
-- バッジ定義マスター
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  threshold jsonb NOT NULL,       -- 例: {"type":"image_count","value":5}
  is_hidden boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ユーザー獲得バッジ
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  notified boolean NOT NULL DEFAULT false,
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
```

### API エンドポイント

| パス | メソッド | 認証 | 機能 |
|------|---------|------|------|
| `/api/achievements` | GET | 必要 | 自分のバッジ一覧（全バッジ + 獲得状態） |
| `/api/achievements/check` | POST | 内部 | バッジ判定（各API処理後に内部呼出） |
| `/api/achievements/notify` | PATCH | 必要 | 通知既読化 |

### 変更ファイル（想定）

| ファイル | 区分 | 内容 |
|---------|------|------|
| `supabase/007_achievements.sql` | 新規 | テーブル + シードデータ（16バッジ） |
| `src/lib/achievement-checker.ts` | 新規 | バッジ判定ロジック |
| `src/app/api/achievements/route.ts` | 新規 | バッジ一覧API |
| `src/components/dashboard/AchievementSection.tsx` | 新規 | ダッシュボード表示 |
| `src/components/AchievementToast.tsx` | 新規 | トースト通知コンポーネント |
| `src/app/dashboard/page.tsx` | 修正 | バッジセクション追加 |
| `src/app/api/generate-image/route.ts` | 修正 | 生成後にバッジ判定呼出 |
| `src/app/api/chat/route.ts` | 修正 | メッセージ送信後にバッジ判定呼出 |

---

## F-23: プロンプトモード（Pro 限定）

### 目的
対話で磨いたプロンプトを保存・再利用できるようにし、リピーターの効率化ニーズに応える。Pro プランの差別化要素。

### コンセプト
> 対話の延長線上にプロンプトモードがある。対話で学んだことをプロンプトとして保存・再利用できる。

### プロンプト保存フロー

```
画像生成完了（チャット or プレビューパネル）
  → 「このプロンプトを保存」ボタン表示
  → 保存モーダル
      - プロンプト名（自動入力: セッションの店名 + 日付）
      - プロンプト内容（自動入力: 生成に使用したプロンプト、編集可能）
  → 保存 → マイプロンプトに追加
```

### プロンプトモードの利用フロー

```
チャット画面
  → 「プロンプトモード」トグル（Pro バッジ付き）
  → [Free ユーザーがタップ] → Pro アップグレード誘導モーダル
  → [Pro ユーザーがタップ] → モード切替

プロンプトモード画面:
┌─────────────────────────────────────┐
│ プロンプトモード                [対話に戻る] │
├─────────────────────────────────────┤
│ マイプロンプト:                         │
│ ┌─────────────────┐ ┌───────────┐    │
│ │ カフェさくらランチ │ │ 居酒屋たろう│    │  ← 保存済みプロンプトから選択
│ └─────────────────┘ └───────────┘    │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ プロンプト入力エリア               │ │  ← 自由記述 or 選択で自動入力
│ │                                  │ │
│ └──────────────────────────────────┘ │
│                                      │
│         [画像を生成する]              │
└─────────────────────────────────────┘
```

### プラン制限

| | Free | Pro |
|---|------|-----|
| プロンプト保存 | 不可 | 無制限 |
| プロンプトモード | 不可（誘導モーダル） | 利用可能 |
| 対話モード | 利用可能 | 利用可能 |

### DB設計

```sql
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
```

### API エンドポイント

| パス | メソッド | 認証 | 機能 |
|------|---------|------|------|
| `/api/prompts/mine` | GET | 必要(Pro) | マイプロンプト一覧 |
| `/api/prompts/mine` | POST | 必要(Pro) | プロンプト保存 |
| `/api/prompts/mine/[id]` | PATCH | 必要(Pro) | プロンプト編集 |
| `/api/prompts/mine/[id]` | DELETE | 必要(Pro) | プロンプト削除 |
| `/api/generate-image` | POST | 必要(Pro) | プロンプトモードからの直接生成（既存API拡張） |

### 変更ファイル（想定）

| ファイル | 区分 | 内容 |
|---------|------|------|
| `supabase/008_user_prompts.sql` | 新規 | テーブル + インデックス |
| `src/app/api/prompts/mine/route.ts` | 新規 | マイプロンプトCRUD |
| `src/app/api/prompts/mine/[id]/route.ts` | 新規 | プロンプト編集・削除 |
| `src/components/chat/PromptMode.tsx` | 新規 | プロンプトモードUI |
| `src/components/chat/SavePromptModal.tsx` | 新規 | プロンプト保存モーダル |
| `src/app/chat/page.tsx` | 修正 | モードトグル + プロンプトモード統合 |
| `src/components/chat/PreviewPanel.tsx` | 修正 | 「プロンプトを保存」ボタン追加 |
| `src/app/api/generate-image/route.ts` | 修正 | プロンプト直接生成対応 |

---

## DB変更サマリー

### 新規テーブル（7テーブル）

| テーブル | 機能 | Phase |
|---------|------|-------|
| `shared_images` | ギャラリー共有画像 | 2-2 |
| `image_likes` | いいね | 2-2 |
| `image_saves` | 保存 | 2-2 |
| `image_reports` | 報告 | 2-2 |
| `achievements` | バッジ定義マスター | 2-3 |
| `user_achievements` | ユーザー獲得バッジ | 2-3 |
| `user_prompts` | マイプロンプト | 2-4 |

### カラム追加（1件）

| テーブル | カラム | 機能 | Phase |
|---------|--------|------|-------|
| `users` | `onboarding_completed_at` | オンボーディング完了日時 | 2-1 |

---

## 新規API一覧

| # | パス | メソッド | Phase | 機能 |
|---|------|---------|-------|------|
| 1 | `/api/gallery` | GET | 2-2 | ギャラリー一覧 |
| 2 | `/api/gallery` | POST | 2-2 | 画像共有 |
| 3 | `/api/gallery/[id]/like` | POST | 2-2 | いいねトグル |
| 4 | `/api/gallery/[id]/save` | POST | 2-2 | 保存トグル |
| 5 | `/api/gallery/[id]/report` | POST | 2-2 | 報告 |
| 6 | `/api/gallery/saves` | GET | 2-2 | 保存画像一覧 |
| 7 | `/api/achievements` | GET | 2-3 | バッジ一覧 |
| 8 | `/api/achievements/notify` | PATCH | 2-3 | 通知既読化 |
| 9 | `/api/prompts/mine` | GET/POST | 2-4 | マイプロンプト |
| 10 | `/api/prompts/mine/[id]` | PATCH/DELETE | 2-4 | プロンプト編集・削除 |

---

## 新規ページ一覧

| パス | Phase | 認証 | 内容 |
|------|-------|------|------|
| `/gallery` | 2-2 | 不要（閲覧）/ 必要（操作） | ギャラリー一覧 |

### 既存ページへの変更

| パス | Phase | 変更内容 |
|------|-------|---------|
| `/dashboard` | 2-1, 2-2, 2-3 | オンボーディング、保存画像セクション、バッジセクション追加 |
| `/chat` | 2-3, 2-4 | バッジ通知、プロンプトモードトグル |

---

## プラン制限まとめ

| 機能 | Free | Pro |
|------|------|-----|
| ギャラリー閲覧 | 無制限 | 無制限 |
| ギャラリー共有 | 無制限 | 無制限 |
| いいね | 無制限 | 無制限 |
| 画像保存（参考画像として使用可能） | 3枚 | 5枚 |
| バッジ | 全16バッジ獲得可能 | 同左 |
| プロンプト保存 | 不可 | 無制限 |
| プロンプトモード | 不可 | 利用可能 |
