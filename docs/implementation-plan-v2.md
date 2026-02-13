# MenuCraft AI — Phase 2 実装計画書

**作成日**: 2026-02-12
**対応要件**: `docs/feature-spec-v2.md`
**ベースブランチ**: develop

---

## 実装順序

| Phase | 機能 | 見積ファイル数 | ブランチ名 |
|-------|------|-------------|-----------|
| 2-1 | オンボーディング | 5ファイル | `feature/onboarding` |
| 2-2 | ギャラリー共有 | 15ファイル | `feature/gallery` |
| 2-3 | アチーブメント | 11ファイル | `feature/achievements` |
| 2-4 | プロンプトモード | 9ファイル | `feature/prompt-mode` |

各 Phase は独立してマージ可能。ただし 2-3 のアチーブメントの一部（`first_share`, `popular`, `collector`, `beloved`）は 2-2 のギャラリーに依存するため、2-2 → 2-3 の順序は必須。

---

## Phase 2-1: オンボーディング

**ブランチ:** `feature/onboarding` — develop から作成

### 変更ファイル一覧（5ファイル）

| # | ファイル | 区分 | 変更概要 |
|---|---------|------|---------|
| 1 | `supabase/005_add_onboarding.sql` | 新規 | users に `onboarding_completed_at` カラム追加 |
| 2 | `src/components/onboarding/OnboardingTour.tsx` | 新規 | 4ステップのツアーコンポーネント |
| 3 | `src/app/dashboard/page.tsx` | 修正 | ツアーの条件付きレンダリング追加 |
| 4 | `src/app/api/account/route.ts` | 修正 | GET に `onboarding_completed_at` 追加、PATCH で完了フラグ更新対応 |
| 5 | `src/hooks/useDashboardData.ts` | 修正 | オンボーディング状態の取得追加 |

### Step 1: DBマイグレーション

**`supabase/005_add_onboarding.sql`** (新規)

```sql
ALTER TABLE public.users ADD COLUMN onboarding_completed_at timestamptz DEFAULT NULL;
```

### Step 2: OnboardingTour コンポーネント

**`src/components/onboarding/OnboardingTour.tsx`** (新規)

- `"use client"` コンポーネント
- Props: `onComplete: () => void`
- State: `step` (1〜4)
- 4ステップの内容:
  1. ようこそ画面 — サービス紹介
  2. チャット機能の紹介 — 「新しいメニューを作成」ボタンをハイライト説明
  3. 対話フローの説明 — 3ステップのミニ図解
  4. CTA — 「チャットを始める」(`/chat` 遷移) / 「あとで始める」(閉じる)
- UI:
  - 固定オーバーレイ（`fixed inset-0 bg-black/50 z-50`）
  - 中央カード（`max-w-[480px] rounded-[20px]`）
  - プログレスドット（4つ）
  - 「次へ」「スキップ」ボタン
  - fadeInUp アニメーション
- 「スキップ」「あとで始める」「チャットを始める」のいずれかで `onComplete()` を呼ぶ

### Step 3: ダッシュボード統合

**`src/app/dashboard/page.tsx`** (修正)

- `/api/account` から `onboarding_completed_at` を取得
- `onboarding_completed_at === null` の場合に `<OnboardingTour>` を表示
- `onComplete` ハンドラーで `PATCH /api/account` に `{ onboarding_completed_at: true }` を送信

### Step 4: アカウントAPI修正

**`src/app/api/account/route.ts`** (修正)

- GET: select に `onboarding_completed_at` を追加
- PATCH: `onboarding_completed_at` パラメータを受け取り、`now()` で更新

### 検証
1. `npm run build` — エラーなし
2. 新規ユーザー登録 → ダッシュボードでツアー表示
3. 各ステップの遷移が正常
4. 「スキップ」「あとで始める」で閉じて再表示されない
5. 「チャットを始める」で `/chat` に遷移
6. 既存ユーザー → ツアー非表示

---

## Phase 2-2: ギャラリー共有

**ブランチ:** `feature/gallery` — develop から作成

### 変更ファイル一覧（15ファイル）

| # | ファイル | 区分 | 変更概要 |
|---|---------|------|---------|
| 1 | `supabase/006_gallery_tables.sql` | 新規 | shared_images, image_likes, image_saves, image_reports テーブル |
| 2 | `src/lib/types.ts` | 修正 | `SharedImage`, `GalleryItem` 型追加 |
| 3 | `src/app/api/gallery/route.ts` | 新規 | ギャラリー一覧(GET) + 画像共有(POST) |
| 4 | `src/app/api/gallery/[id]/like/route.ts` | 新規 | いいねトグルAPI |
| 5 | `src/app/api/gallery/[id]/save/route.ts` | 新規 | 保存トグルAPI（枚数制限チェック） |
| 6 | `src/app/api/gallery/[id]/report/route.ts` | 新規 | 報告API |
| 7 | `src/app/api/gallery/saves/route.ts` | 新規 | 自分の保存画像一覧API |
| 8 | `src/app/gallery/page.tsx` | 新規 | ギャラリー一覧ページ |
| 9 | `src/components/gallery/GalleryCard.tsx` | 新規 | 画像カードコンポーネント |
| 10 | `src/components/gallery/ShareModal.tsx` | 新規 | 共有確認モーダル |
| 11 | `src/components/landing/Header.tsx` | 修正 | ナビに「ギャラリー」リンク追加 |
| 12 | `src/components/chat/PreviewPanel.tsx` | 修正 | 「ギャラリーに共有」ボタン追加 |
| 13 | `src/app/dashboard/page.tsx` | 修正 | セッションカードに「共有」ボタン追加 |
| 14 | `src/components/dashboard/SessionCard.tsx` | 修正 | 共有ボタンUI追加 |
| 15 | `src/middleware.ts` | 確認 | `/gallery` が認証不要であることを確認（matcher に含めない） |

### Step 1: DBマイグレーション

**`supabase/006_gallery_tables.sql`** (新規)

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
```

### Step 2: 型定義

**`src/lib/types.ts`** (修正) — 末尾に追加

```typescript
export type GalleryItem = {
  id: string;
  image_url: string;
  prompt: string;
  category: string;
  shop_name: string | null;
  show_shop_name: boolean;
  user_name: string;
  created_at: string;
  like_count: number;
  save_count: number;
  is_liked: boolean;   // ログインユーザーがいいね済みか
  is_saved: boolean;   // ログインユーザーが保存済みか
};
```

### Step 3: ギャラリーAPI（一覧 + 共有）

**`src/app/api/gallery/route.ts`** (新規)

**GET** `/api/gallery?page=1&category=cafe&sort=recent`
- 認証不要（ただしログインユーザーの場合は `is_liked`, `is_saved` を計算）
- `shared_images` JOIN `generated_images` JOIN `users` でデータ取得
- `image_likes` / `image_saves` のカウントをサブクエリで取得
- カテゴリフィルター: `category` パラメータ（省略時は全件）
- ソート: `recent`(デフォルト) / `likes` / `saves`
- ページネーション: 10件/ページ
- レスポンス: `{ items: GalleryItem[], total, page, totalPages }`

**POST** `/api/gallery`
- 認証必要
- Body: `{ image_id, category, show_shop_name }`
- 同じ画像の重複共有をチェック
- `shared_images` に INSERT
- レスポンス: `{ shared_image }`

### Step 4: いいね / 保存 / 報告API

**`src/app/api/gallery/[id]/like/route.ts`** (新規)
- POST: トグル（存在すれば DELETE、なければ INSERT）
- レスポンス: `{ liked: boolean, like_count: number }`

**`src/app/api/gallery/[id]/save/route.ts`** (新規)
- POST: トグル（存在すれば DELETE、なければ INSERT）
- 保存時に枚数制限チェック（Free: 3枚 / Pro: 5枚）
- 制限超過時は `{ error: "保存枚数の上限に達しています" }`
- レスポンス: `{ saved: boolean, save_count: number }`

**`src/app/api/gallery/[id]/report/route.ts`** (新規)
- POST: `{ reason, detail? }`
- `image_reports` に INSERT
- レスポンス: `{ message: "報告を受け付けました" }`

### Step 5: 保存画像一覧API

**`src/app/api/gallery/saves/route.ts`** (新規)
- GET: 認証必要
- 自分が保存した画像の一覧を返却
- チャット開始時の参考画像選択で使用

### Step 6: ギャラリーページ

**`src/app/gallery/page.tsx`** (新規)

- `"use client"` コンポーネント
- 既存の Header コンポーネントを使用（`activeTab="gallery"`）
- カテゴリタブ: すべて / カフェ / 居酒屋 / イタリアン / スイーツ / ラーメン / その他
- ソートセレクト: 新着 / いいね順 / 保存順
- `GalleryCard` コンポーネントのグリッド表示（レスポンシブ: 1〜3カラム）
- ページネーション
- ローディングスケルトン

### Step 7: GalleryCard + ShareModal コンポーネント

**`src/components/gallery/GalleryCard.tsx`** (新規)
- 画像サムネイル（aspect-square）
- いいねボタン + カウント
- 保存ボタン + カウント
- カテゴリバッジ
- 店名（`show_shop_name` が true の場合のみ）
- ホバーエフェクト（既存パターン踏襲）

**`src/components/gallery/ShareModal.tsx`** (新規)
- Props: `imageId, sessionCategory, shopName, onClose, onShared`
- 画像プレビュー
- カテゴリ選択（セッションから自動入力、ドロップダウンで変更可能）
- 「店名を表示する」チェックボックス（デフォルトOFF）
- 「共有する」「キャンセル」ボタン

### Step 8: 既存コンポーネント修正

**`src/components/landing/Header.tsx`** (修正)
- デスクトップナビに「ギャラリー」リンク追加（`/gallery`）
- モバイルメニューにも追加
- `activeTab` に `"gallery"` を追加

**`src/components/chat/PreviewPanel.tsx`** (修正)
- 画像生成完了後に「ギャラリーに共有」ボタン追加（ダウンロードボタンの横）
- クリック → `ShareModal` 表示

**`src/components/dashboard/SessionCard.tsx`** (修正)
- 画像があるセッションに「共有」ボタン追加
- クリック → `ShareModal` 表示

### 検証
1. `npm run build` — エラーなし
2. `/gallery` — 未ログインで閲覧可能
3. カテゴリフィルター、ソート、ページネーションが動作
4. ログインユーザーがいいね / 保存できる
5. 保存枚数制限が機能する（Free: 3枚）
6. PreviewPanel / SessionCard から共有モーダルが開く
7. 共有後にギャラリーに表示される
8. 店名表示ON/OFFが反映される
9. 報告機能が動作する

---

## Phase 2-3: アチーブメント

**ブランチ:** `feature/achievements` — develop から作成（Phase 2-2 マージ後）

### 変更ファイル一覧（11ファイル）

| # | ファイル | 区分 | 変更概要 |
|---|---------|------|---------|
| 1 | `supabase/007_achievements.sql` | 新規 | achievements + user_achievements テーブル + 16バッジのシードデータ |
| 2 | `src/lib/types.ts` | 修正 | `Achievement`, `UserAchievement` 型追加 |
| 3 | `src/lib/achievement-checker.ts` | 新規 | バッジ判定ロジック（各条件のチェッカー関数） |
| 4 | `src/app/api/achievements/route.ts` | 新規 | バッジ一覧取得API（表示バッジ + 獲得済み非表示バッジ） |
| 5 | `src/app/api/achievements/check/route.ts` | 新規 | バッジ判定API（内部呼出用） |
| 6 | `src/components/dashboard/AchievementSection.tsx` | 新規 | ダッシュボードのバッジ表示セクション |
| 7 | `src/components/AchievementToast.tsx` | 新規 | トースト通知コンポーネント |
| 8 | `src/app/dashboard/page.tsx` | 修正 | AchievementSection 追加 + トースト統合 |
| 9 | `src/app/api/generate-image/route.ts` | 修正 | 画像生成後にバッジ判定呼出追加 |
| 10 | `src/app/api/chat/route.ts` | 修正 | メッセージ送信後にバッジ判定呼出追加 |
| 11 | `src/app/api/gallery/route.ts` | 修正 | 共有後にバッジ判定呼出追加 |

### Step 1: DBマイグレーション + シードデータ

**`supabase/007_achievements.sql`** (新規)

- `achievements` テーブル作成
- `user_achievements` テーブル作成
- 16バッジのシードデータ INSERT
  - 表示バッジ 8個: `is_hidden = false`, `sort_order = 1〜8`
  - 非表示バッジ 8個: `is_hidden = true`, `sort_order = 9〜16`
  - `threshold` カラムに JSON で条件格納
    - 例: `{"type": "image_count", "value": 5}`
    - 例: `{"type": "message_count", "value": 50}`
    - 例: `{"type": "hour_before", "value": 6}` (早起き)

### Step 2: 型定義

**`src/lib/types.ts`** (修正)

```typescript
export type Achievement = {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  is_hidden: boolean;
  unlocked_at: string | null;  // null = 未獲得
  notified: boolean;
};
```

### Step 3: バッジ判定ロジック

**`src/lib/achievement-checker.ts`** (新規)

- `checkAchievements(userId: string): Promise<Achievement[]>` — 新規獲得バッジを返却
- 各条件のチェッカー:
  - `image_count`: `generated_images` の COUNT
  - `message_count`: `messages` WHERE role='user' の COUNT
  - `session_completed`: `chat_sessions` WHERE status='completed' の COUNT
  - `login_days`: `api_usage_logs` の DISTINCT DATE の COUNT
  - `share_count`: `shared_images` の COUNT
  - `total_likes_received`: 自分の shared_images に対する likes の合計
  - `save_count`: `image_saves` の COUNT（自分が保存した数）
  - `single_image_likes`: 自分の shared_images 1枚あたりの最大 likes
  - `category_count`: `chat_sessions` の DISTINCT category の COUNT
  - `hour_before` / `hour_after`: 画像生成時刻の判定
  - `session_messages_lte`: セッション内メッセージ数が閾値以下で画像生成済み
  - `session_regenerate_gte`: 同一セッション内の画像再生成回数
  - `signup_hours_images`: 登録からの経過時間内の画像生成数
- 未獲得の achievement に対してのみ判定を実行
- 新規獲得分を `user_achievements` に INSERT

### Step 4: バッジAPI

**`src/app/api/achievements/route.ts`** (新規)

- GET: 認証必要
- 全バッジ一覧 + ユーザーの獲得状態を返却
  - 表示バッジ: 全8個（獲得/未獲得含む）
  - 非表示バッジ: 獲得済みのもののみ
- 未通知バッジの件数も返却

**`src/app/api/achievements/check/route.ts`** (新規)

- POST: 認証必要（内部呼出用）
- `achievement-checker.ts` を呼び出して判定実行
- 新規獲得バッジがあればレスポンスに含める

### Step 5: ダッシュボードUI

**`src/components/dashboard/AchievementSection.tsx`** (新規)

- 表示バッジ: 横一列に8個（獲得=カラー+accent-gold枠 / 未獲得=グレー+ロック）
- 非表示バッジ: 「+ 非表示バッジ X/8 獲得」+ 獲得済みのみ表示
- 各バッジホバーでツールチップ（名前 + 条件説明）
- 未通知バッジがある場合は通知ドット表示

**`src/components/AchievementToast.tsx`** (新規)

- Props: `achievement: Achievement, onClose: () => void`
- 画面上部に固定表示、3秒後に自動フェードアウト
- アイコン + バッジ名 + 「獲得しました！」

### Step 6: 既存API修正

**`src/app/api/generate-image/route.ts`** (修正)
- 画像保存成功後に `achievement-checker` をバックグラウンドで呼出
- レスポンスに `newAchievements` フィールドを追加（フロントでトースト表示用）

**`src/app/api/chat/route.ts`** (修正)
- メッセージ保存後に `achievement-checker` をバックグラウンドで呼出

**`src/app/api/gallery/route.ts`** (修正)
- 共有POST成功後に `achievement-checker` をバックグラウンドで呼出

### Step 7: ダッシュボード統合

**`src/app/dashboard/page.tsx`** (修正)

- StatsSection の下に `<AchievementSection>` を追加
- `/api/achievements` からバッジデータを取得
- 未通知バッジがある場合にトースト表示

### 検証
1. `npm run build` — エラーなし
2. ダッシュボードにバッジセクション表示（初期状態: 全グレー）
3. 画像1枚生成 → 「はじめての一枚」獲得 → トースト表示
4. ダッシュボードリロードでバッジがカラー表示
5. 非表示バッジの条件達成 → サプライズ通知
6. 既存機能（チャット、画像生成、ダッシュボード）に影響なし
7. バッジ判定のパフォーマンス（APIレスポンス時間に大きな影響がないこと）

---

## Phase 2-4: プロンプトモード

**ブランチ:** `feature/prompt-mode` — develop から作成

### 変更ファイル一覧（9ファイル）

| # | ファイル | 区分 | 変更概要 |
|---|---------|------|---------|
| 1 | `supabase/008_user_prompts.sql` | 新規 | user_prompts テーブル |
| 2 | `src/lib/types.ts` | 修正 | `UserPrompt` 型追加 |
| 3 | `src/app/api/prompts/mine/route.ts` | 新規 | マイプロンプト一覧(GET) + 保存(POST) |
| 4 | `src/app/api/prompts/mine/[id]/route.ts` | 新規 | プロンプト編集(PATCH) + 削除(DELETE) |
| 5 | `src/components/chat/PromptMode.tsx` | 新規 | プロンプトモードUI（プロンプト選択 + 入力 + 生成ボタン） |
| 6 | `src/components/chat/SavePromptModal.tsx` | 新規 | プロンプト保存モーダル |
| 7 | `src/app/chat/page.tsx` | 修正 | モードトグル追加 + PromptMode 統合 |
| 8 | `src/components/chat/PreviewPanel.tsx` | 修正 | 「プロンプトを保存」ボタン追加 |
| 9 | `src/app/api/generate-image/route.ts` | 修正 | プロンプト直接生成対応（`mode: "prompt"` パラメータ） |

### Step 1: DBマイグレーション

**`supabase/008_user_prompts.sql`** (新規)

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

ALTER TABLE public.user_prompts ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_user_prompts_user_id ON public.user_prompts(user_id);

CREATE TRIGGER set_updated_at_user_prompts
  BEFORE UPDATE ON public.user_prompts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

### Step 2: 型定義

**`src/lib/types.ts`** (修正)

```typescript
export type UserPrompt = {
  id: string;
  name: string;
  prompt_text: string;
  category: string | null;
  usage_count: number;
  created_at: string;
  updated_at: string;
};
```

### Step 3: マイプロンプトAPI

**`src/app/api/prompts/mine/route.ts`** (新規)

- GET: 認証必要 + Pro チェック
  - 自分のプロンプト一覧を `updated_at DESC` で返却
- POST: 認証必要 + Pro チェック
  - Body: `{ name, prompt_text, category? }`
  - `user_prompts` に INSERT

**`src/app/api/prompts/mine/[id]/route.ts`** (新規)

- PATCH: プロンプト名/テキスト/カテゴリの更新
- DELETE: プロンプト削除
- いずれも所有者チェック付き

### Step 4: プロンプトモードUI

**`src/components/chat/PromptMode.tsx`** (新規)

- マイプロンプト一覧をカードで表示（選択可能）
- プロンプト入力テキストエリア（選択で自動入力、自由編集も可能）
- 「画像を生成する」ボタン
- 生成後は PreviewPanel に画像表示（既存フローを利用）

**`src/components/chat/SavePromptModal.tsx`** (新規)

- Props: `prompt, sessionName, category, onClose, onSaved`
- プロンプト名入力（デフォルト: セッション名 + 日付）
- プロンプトテキスト表示（編集可能）
- 「保存する」「キャンセル」ボタン

### Step 5: チャットページ統合

**`src/app/chat/page.tsx`** (修正)

- ヘッダー部に「プロンプトモード」トグル追加
  - Pro ユーザー: モード切替可能
  - Free ユーザー: タップ → Pro アップグレード誘導モーダル（既存 `PlanLimitModal` パターン）
- トグル ON → チャットUI非表示、`<PromptMode>` 表示
- トグル OFF → 通常のチャットUI
- Pro 判定: セッションの `user.role` では不十分 → 将来的にプラン情報が必要
  - 暫定: `user.role === "admin"` は常にPro扱い、それ以外は Free

### Step 6: PreviewPanel修正

**`src/components/chat/PreviewPanel.tsx`** (修正)

- 画像生成完了後に「プロンプトを保存」ボタン追加（Pro ユーザーのみ表示）
- クリック → `SavePromptModal` 表示

### Step 7: 画像生成API修正

**`src/app/api/generate-image/route.ts`** (修正)

- 新規パラメータ: `mode: "chat" | "prompt"`, `direct_prompt?: string`
- `mode === "prompt"` の場合:
  - `direct_prompt` をそのまま Gemini に送信（テンプレート展開をスキップ）
  - セッション不要（新規セッションを自動作成 or セッションなしで生成）
- `mode === "chat"` の場合: 既存処理のまま

### 検証
1. `npm run build` — エラーなし
2. Pro ユーザーでプロンプトモードに切替 → プロンプト入力 → 画像生成
3. Free ユーザーでトグル → アップグレードモーダル表示
4. プロンプト保存 → マイプロンプト一覧に表示
5. 保存したプロンプトを選択 → 自動入力 → 再生成
6. プロンプトの編集/削除が動作
7. 対話モードに戻して通常のチャットフローが正常動作
8. `usage_count` がインクリメントされる

---

## 全体スケジュール

```
Phase 2-1 (オンボーディング)
  ├─ 5ファイル
  └─ → develop マージ → 動作確認 → main マージ

Phase 2-2 (ギャラリー共有)
  ├─ 15ファイル
  └─ → develop マージ → 動作確認 → main マージ

Phase 2-3 (アチーブメント)  ※ 2-2 完了後
  ├─ 11ファイル
  └─ → develop マージ → 動作確認 → main マージ

Phase 2-4 (プロンプトモード)
  ├─ 9ファイル
  └─ → develop マージ → 動作確認 → main マージ
```

---

## リスクと注意事項

| リスク | 対策 |
|--------|------|
| ギャラリーの画像URL（Supabase Storage の公開URL） | 既存の `generated` バケットは public 設定済み。そのまま利用可能 |
| バッジ判定のパフォーマンス | 各API呼出後に非同期で判定。レスポンスをブロックしない設計 |
| Pro プラン判定の仕組みが未実装 | Phase 2-4 では暫定的に admin=Pro で対応。Stripe 連携後に正式実装 |
| ギャラリーの初期コンテンツ不足 | ダミーデータのシードファイルを用意して初期状態でも空にならないようにする |
| 既存の `reference_images`（管理者参考画像）と保存画像の使い分け | 管理者参考画像は全ユーザーに適用、保存画像はユーザー個別の参考。併用可能 |
