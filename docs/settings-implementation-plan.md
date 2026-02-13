# 設定画面拡充 — 実装計画書

**作成日**: 2026-02-13
**ステータス**: ドラフト v1.1（セルフチェック反映済み）
**前提**: [settings-development-plan.md](./settings-development-plan.md) の開発計画に基づく

---

## 1. 技術方針

### 1.1 アーキテクチャ

```
┌─ フロントエンド ──────────────────────────────────┐
│ /settings (page.tsx)                               │
│   ├─ SettingsSidenav (既存・拡張)                    │
│   ├─ ProfileSection.tsx          ← 新規            │
│   ├─ GenerationDefaultsSection.tsx ← 新規           │
│   ├─ SecuritySection.tsx         ← 新規            │
│   ├─ NotificationSection.tsx     ← 新規            │
│   ├─ UsageSection.tsx            ← 新規            │
│   ├─ AppearanceSection.tsx       ← 新規 (Tier 3)   │
│   ├─ PrivacySection.tsx          ← 新規 (Tier 3)   │
│   ├─ PlanSection.tsx             ← 既存リファクタ    │
│   └─ DangerSection.tsx           ← 既存リファクタ    │
└────────────────────────────────────────────────────┘
         │
         ▼
┌─ API ─────────────────────────────────────────────┐
│ /api/account         PATCH (既存・拡張+パスワード変更済) │
│ /api/account/avatar     POST/DELETE ← 新規          │
│ /api/account/settings   GET/PATCH ← 新規            │
│ /api/account/usage      GET ← 新規                  │
│ /api/account/export     POST ← 新規                 │
│ /api/account/sessions   DELETE ← 新規（全ログアウト）  │
└────────────────────────────────────────────────────┘
         │
         ▼
┌─ DB (Supabase) ───────────────────────────────────┐
│ users テーブル ← カラム追加                          │
│ user_settings テーブル ← 新規作成                    │
│ notification_preferences テーブル ← 新規作成         │
└────────────────────────────────────────────────────┘
```

### 1.2 設計原則

- **既存コンポーネントの分割**: 現在の `settings/page.tsx` (317行) をセクション単位のコンポーネントに分離
- **設定データの一元管理**: `user_settings` テーブルに JSONB でまとめず、カラム単位で管理（型安全・インデックス可）
- **即時保存 vs 明示的保存**: トグル系は即時 PATCH、フォーム系は「保存」ボタンで PATCH
- **楽観的UI更新**: 保存ボタン押下時にUIを即反映し、エラー時にロールバック

---

## 2. DBマイグレーション

### 2.1 users テーブル — カラム追加

```sql
-- supabase/010_settings_profile_columns.sql
-- ※001〜009は使用済み

ALTER TABLE public.users
  ADD COLUMN avatar_url text DEFAULT NULL,
  ADD COLUMN business_type text DEFAULT NULL,
  ADD COLUMN shop_concept text DEFAULT NULL,
  ADD COLUMN brand_color_primary text DEFAULT NULL,
  ADD COLUMN brand_color_secondary text DEFAULT NULL,
  ADD COLUMN prefecture text DEFAULT NULL,
  ADD COLUMN website_url text DEFAULT NULL,
  ADD COLUMN sns_instagram text DEFAULT NULL,
  ADD COLUMN sns_x text DEFAULT NULL;

COMMENT ON COLUMN public.users.business_type IS '業態: izakaya/cafe/french/italian/japanese/chinese/ramen/yakiniku/other';
COMMENT ON COLUMN public.users.shop_concept IS '店舗コンセプト（200文字以内）';
COMMENT ON COLUMN public.users.brand_color_primary IS 'ブランドカラー（メイン）HEX値';
COMMENT ON COLUMN public.users.brand_color_secondary IS 'ブランドカラー（サブ）HEX値';
```

### 2.2 user_settings テーブル — 新規作成

```sql
-- supabase/011_create_user_settings.sql

CREATE TABLE public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,

  -- 画像生成デフォルト (S-02)
  default_sizes text[] NOT NULL DEFAULT ARRAY['1:1'],
  default_style text DEFAULT NULL,
  default_text_language text NOT NULL DEFAULT 'ja',
  default_photo_style text DEFAULT NULL,

  -- 表示設定 (S-06)
  theme text NOT NULL DEFAULT 'system' CHECK (theme IN ('system', 'light', 'dark')),
  reduce_animations boolean NOT NULL DEFAULT false,
  ui_language text NOT NULL DEFAULT 'ja',

  -- プライバシー (S-07)
  ai_data_usage boolean NOT NULL DEFAULT true,
  gallery_show_shop_name boolean NOT NULL DEFAULT true,
  analytics_data_sharing boolean NOT NULL DEFAULT true,

  -- タイムスタンプ
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- インデックス
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);

-- 更新トリガー
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);
```

### 2.3 notification_preferences テーブル — 新規作成

```sql
-- supabase/012_create_notification_preferences.sql

CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,

  -- 通知カテゴリ (S-04)
  new_features boolean NOT NULL DEFAULT true,
  generation_complete boolean NOT NULL DEFAULT true,
  gallery_reactions boolean NOT NULL DEFAULT true,
  marketing boolean NOT NULL DEFAULT false,

  -- 頻度
  email_frequency text NOT NULL DEFAULT 'realtime'
    CHECK (email_frequency IN ('realtime', 'daily', 'weekly', 'off')),

  -- タイムスタンプ
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_prefs_user_id ON public.notification_preferences(user_id);

CREATE TRIGGER update_notification_prefs_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
```

---

## 3. API設計

### 3.1 既存API拡張

#### `PATCH /api/account`（拡張）

現在は `name` と `onboarding_completed_at` のみ対応。以下のフィールドを追加:

```typescript
// リクエストボディ（追加分）
{
  name?: string;
  business_type?: string;
  shop_concept?: string;
  brand_color_primary?: string;
  brand_color_secondary?: string;
  prefecture?: string;
  website_url?: string;
  sns_instagram?: string;
  sns_x?: string;
}
```

#### `GET /api/account`（拡張）

レスポンスに追加カラムを含める:

```typescript
{
  user: {
    id, email, name, role, created_at,
    // 追加
    avatar_url, business_type, shop_concept,
    brand_color_primary, brand_color_secondary,
    prefecture, website_url, sns_instagram, sns_x
  }
}
```

### 3.2 新規API

> **注**: パスワード変更は既存の `PATCH /api/account` に実装済み（`current_password` + `new_password` フィールド）。
> 新規エンドポイントは不要。`PasswordChangeForm` コンポーネントも既存。

#### `POST /api/account/avatar`

```typescript
// リクエスト: FormData (file: File)
// - 最大5MB、JPEG/PNG/WebP
// - sharpで256x256にリサイズ
// - Supabase Storage "avatars" バケットに保存
// - users.avatar_url を更新

// レスポンス
{ avatar_url: string; }
```

#### `DELETE /api/account/avatar`

```typescript
// Supabase Storageから削除 + users.avatar_url = null
{ message: "プロフィール写真を削除しました。" }
```

#### `GET /api/account/settings`

```typescript
// user_settings + notification_preferences を結合して返却
{
  generation: { default_sizes, default_style, default_text_language, default_photo_style },
  appearance: { theme, reduce_animations, ui_language },
  privacy: { ai_data_usage, gallery_show_shop_name, analytics_data_sharing },
  notifications: { new_features, generation_complete, gallery_reactions, marketing, email_frequency }
}

// 未作成の場合はデフォルト値で自動作成（upsert）
```

#### `PATCH /api/account/settings`

```typescript
// リクエスト: 部分更新（変更のあるフィールドのみ送信）
{
  generation?: { ... },
  appearance?: { ... },
  privacy?: { ... },
  notifications?: { ... }
}
```

#### `GET /api/account/usage`

```typescript
// レスポンス
{
  current_period: {
    image_generations_today: number;
    image_generation_limit_today: number;  // Free: 3, Pro: unlimited(-1)
    sessions_this_month: number;
    session_limit_this_month: number;      // Free: 3, Pro: unlimited(-1)
  },
  totals: {
    total_images: number;
    total_sessions: number;
    total_api_calls: number;
    storage_used_mb: number;
  },
  daily_chart: Array<{ date: string; count: number; }>  // 直近30日
}
```

#### `POST /api/account/export`

```typescript
// 生成画像の一括ZIPダウンロード
// - Supabase Storageから対象ユーザーの画像を取得
// - ZIPに圧縮して返却（ストリーミング）
// - Content-Disposition: attachment; filename="menucraft-export-{date}.zip"
```

#### `DELETE /api/account/sessions`

```typescript
// 全デバイスからのログアウト
// - users.updated_at を現在時刻に更新
// - JWT の iat < updated_at のセッションを middleware で拒否
{ message: "すべてのデバイスからログアウトしました。" }
```

---

## 4. フロントエンド実装

### 4.1 コンポーネント構成

```
src/
├── app/settings/page.tsx              ← リファクタ（セクション読み込みのみ）
├── components/settings/
│   ├── SettingsSidenav.tsx            ← 既存・ナビ項目追加
│   ├── ProfileSection.tsx            ← 新規 (Tier 1)
│   ├── GenerationDefaultsSection.tsx ← 新規 (Tier 1)
│   ├── SecuritySection.tsx           ← 新規 (Tier 2)
│   ├── NotificationSection.tsx       ← 新規 (Tier 2)
│   ├── UsageSection.tsx              ← 新規 (Tier 2)
│   ├── AppearanceSection.tsx         ← 新規 (Tier 3)
│   ├── PrivacySection.tsx            ← 新規 (Tier 3)
│   ├── PlanSection.tsx               ← 既存コード抽出
│   ├── DangerSection.tsx             ← 既存コード抽出
│   └── shared/
│       ├── SettingsCard.tsx           ← 共通カードラッパー
│       ├── SettingsToggle.tsx         ← トグルスイッチ（即時保存）
│       ├── ColorPicker.tsx            ← カラーピッカー
│       └── UsageProgressBar.tsx       ← 使用量プログレスバー
├── hooks/
│   ├── useSettings.ts                ← 設定データのfetch/update
│   └── useUsage.ts                   ← 使用状況データのfetch
└── lib/
    └── types.ts                      ← 型定義追加
```

### 4.2 型定義追加（types.ts）

```typescript
// --- ユーザー設定 ---
export type BusinessType =
  | "izakaya" | "cafe" | "french" | "italian"
  | "japanese" | "chinese" | "ramen" | "yakiniku" | "other";

export type DesignStyle =
  | "pop" | "chic" | "japanese" | "modern" | "natural" | "minimal";

export type PhotoStyle =
  | "realistic" | "illustration" | "watercolor" | "flat";

export type ImageSize = "1:1" | "9:16" | "16:9";

export type Theme = "system" | "light" | "dark";

export type EmailFrequency = "realtime" | "daily" | "weekly" | "off";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url: string | null;
  business_type: BusinessType | null;
  shop_concept: string | null;
  brand_color_primary: string | null;
  brand_color_secondary: string | null;
  prefecture: string | null;
  website_url: string | null;
  sns_instagram: string | null;
  sns_x: string | null;
  created_at: string;
}

export interface UserSettings {
  generation: {
    default_sizes: ImageSize[];
    default_style: DesignStyle | null;
    default_text_language: string;
    default_photo_style: PhotoStyle | null;
  };
  appearance: {
    theme: Theme;
    reduce_animations: boolean;
    ui_language: string;
  };
  privacy: {
    ai_data_usage: boolean;
    gallery_show_shop_name: boolean;
    analytics_data_sharing: boolean;
  };
  notifications: {
    new_features: boolean;
    generation_complete: boolean;
    gallery_reactions: boolean;
    marketing: boolean;
    email_frequency: EmailFrequency;
  };
}

export interface UsageStats {
  current_period: {
    image_generations_today: number;
    image_generation_limit_today: number;
    sessions_this_month: number;
    session_limit_this_month: number;
  };
  totals: {
    total_images: number;
    total_sessions: number;
    total_api_calls: number;
    storage_used_mb: number;
  };
  daily_chart: Array<{ date: string; count: number }>;
}
```

### 4.3 カスタムフック

#### `useSettings.ts`

```typescript
// 設定データの取得・更新を管理
// - GET /api/account (プロフィール)
// - GET /api/account/settings (設定値)
// - PATCH /api/account (プロフィール更新)
// - PATCH /api/account/settings (設定更新)
// - 楽観的UI更新 + エラー時ロールバック
// - SWR or useEffect + useState パターン
```

#### `useUsage.ts`

```typescript
// 使用状況の取得
// - GET /api/account/usage
// - 30秒間隔の自動リフレッシュは不要（ページ遷移時のみ）
```

---

## 5. チャット連携の実装

### 5.1 店舗プロフィールの自動注入

`useChatSession.ts`（または分割後の `useChatFlow.ts`）を修正:

```typescript
// セッション開始時に店舗プロフィールをfetch
const profile = await fetch("/api/account").then(r => r.json());

// Gemini APIへのシステムプロンプトに注入
const systemContext = profile.user.business_type
  ? `ユーザーの店舗情報:
     店名: ${profile.user.name}
     業態: ${profile.user.business_type}
     コンセプト: ${profile.user.shop_concept || "未設定"}
     ブランドカラー: ${profile.user.brand_color_primary || "未設定"}
     この情報を踏まえて、既に把握済みの項目は再度質問せず、
     未設定の項目のみヒアリングしてください。`
  : null;
```

### 5.2 生成デフォルトの自動適用

画像生成リクエスト時:

```typescript
// /api/generate-image に送信する際、ユーザーのデフォルト設定をマージ
const settings = await fetch("/api/account/settings").then(r => r.json());
const sizes = selectedSizes.length > 0
  ? selectedSizes
  : settings.generation.default_sizes;
```

---

## 6. Tier別 実装ステップ

### Tier 1 実装手順

```
Step 1: DBマイグレーション
  - 010_settings_profile_columns.sql 実行
  - 011_create_user_settings.sql 実行

Step 2: 型定義の追加
  - src/lib/types.ts に UserProfile, UserSettings 等を追加

Step 3: API拡張
  - GET /api/account — 新カラムをselect に追加
  - PATCH /api/account — 新フィールドのバリデーション+更新
  - GET/PATCH /api/account/settings — 新規作成

Step 4: コンポーネント作成
  - SettingsCard.tsx（共通ラッパー）
  - ColorPicker.tsx
  - ProfileSection.tsx
  - GenerationDefaultsSection.tsx

Step 5: page.tsx リファクタ
  - 既存コードをセクションコンポーネントに分離
  - 新セクションを追加
  - SettingsSidenav のナビ項目更新

Step 6: チャット連携
  - useChatSession.ts に店舗プロフィール注入ロジック追加
  - generate-image に生成デフォルト適用ロジック追加

Step 7: テスト
  - API テスト: /api/account PATCH（新フィールド）
  - API テスト: /api/account/settings GET/PATCH
  - ビルド確認
```

### Tier 2 実装手順

```
Step 1: DBマイグレーション
  - 012_create_notification_preferences.sql 実行

Step 2: API作成
  - POST/DELETE /api/account/avatar
  - GET /api/account/usage
  - DELETE /api/account/sessions（全ログアウト）

Step 3: Supabase Storage
  - "avatars" バケット作成
  - RLSポリシー設定

Step 4: コンポーネント作成
  - SecuritySection.tsx
  - NotificationSection.tsx
  - UsageSection.tsx + UsageProgressBar.tsx
  - SettingsToggle.tsx（共通トグル）

Step 5: middleware.ts 拡張
  - 全デバイスログアウト用の iat チェック追加

Step 6: テスト
  - API テスト: password, avatar, usage, sessions
  - ビルド確認
```

### Tier 3 実装手順

```
Step 1: テーマ対応
  - globals.css にダークテーマ変数定義
  - AppLayout にテーマプロバイダー追加
  - AppearanceSection.tsx 作成

Step 2: プライバシー設定
  - PrivacySection.tsx 作成（トグル3つ）
  - チャットAPI側でai_data_usageフラグ確認

Step 3: テスト + ビルド確認
```

---

## 7. バリデーションルール

| フィールド | ルール |
|-----------|--------|
| shop_concept | 最大200文字 |
| brand_color_* | `/^#[0-9A-Fa-f]{6}$/` |
| website_url | URL形式（https://で始まる） |
| sns_instagram | `@`なしのハンドル、英数字+アンダースコア |
| sns_x | 同上 |
| new_password | 8文字以上、英字+数字を含む |
| avatar | 最大5MB、JPEG/PNG/WebP |
| default_sizes | `["1:1"]`, `["1:1","9:16"]` 等の配列 |

---

## 8. テスト計画

### 8.1 APIテスト（Vitest）

| テストファイル | テスト数（目安） | 内容 |
|--------------|----------------|------|
| `account-profile.test.ts` | 8 | プロフィール拡張フィールドのCRUD |
| `account-settings.test.ts` | 10 | user_settings の GET/PATCH、デフォルト自動作成 |
| `account-password.test.ts` | 6 | 既存PATCH /api/accountのパスワード変更パス検証 |
| `account-avatar.test.ts` | 5 | アップロード・削除・サイズ制限 |
| `account-usage.test.ts` | 4 | 使用状況集計の正確性 |
| **合計** | **約33テスト** | |

### 8.2 手動テスト

- [ ] プロフィール入力 → チャット開始 → AI が店舗情報を把握していることを確認
- [ ] 生成デフォルト設定 → 新セッション → デフォルト値が適用されることを確認
- [ ] パスワード変更 → ログアウト → 新パスワードでログイン
- [ ] 全デバイスログアウト → 別ブラウザのセッションが無効化されることを確認
- [ ] Free プラン制限が使用状況セクションに正しく表示されること
- [ ] モバイル表示（設定サイドナビのレスポンシブ動作）

---

## 9. 影響範囲

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `src/app/settings/page.tsx` | **大幅リファクタ** | セクション分離、新セクション追加 |
| `src/app/api/account/route.ts` | 拡張 | 新フィールド対応 |
| `src/components/settings/SettingsSidenav.tsx` | 拡張 | ナビ項目追加 |
| `src/hooks/useChatSession.ts` | 修正 | 店舗プロフィール注入 |
| `src/app/api/generate-image/route.ts` | 修正 | 生成デフォルト適用 |
| `src/app/api/chat/route.ts` | 修正 | システムプロンプトに店舗情報注入 |
| `src/lib/types.ts` | 追加 | 新しい型定義 |
| `src/middleware.ts` | 修正 | 全ログアウト対応 |
| `supabase/` | 新規 | マイグレーション3ファイル |

---

*本実装計画書はドラフトです。開発セッション開始時に最新のコードベースと突き合わせて調整してください。*
