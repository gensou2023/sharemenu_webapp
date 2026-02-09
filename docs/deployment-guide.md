# MenuCraft AI デプロイガイド

## 環境情報

| 項目 | 値 |
|------|-----|
| フレームワーク | Next.js 15.5.x（App Router） |
| ホスティング | Vercel（Hobby プラン） |
| データベース | Supabase（PostgreSQL） |
| リポジトリ | https://github.com/gensou2023/sharemenu_webapp |
| 本番URL | https://sharemenu-webapp.vercel.app |
| AI API | Google Gemini 2.0 Flash |
| 認証 | NextAuth.js v5（Credentials） |

---

## Vercel 環境変数（必須）

Vercel ダッシュボード > Settings > Environment Variables に以下を設定：

| Key | 説明 | 取得方法 |
|-----|------|----------|
| `AUTH_SECRET` | NextAuth の暗号化キー | `npx auth secret` で生成 |
| `GEMINI_API_KEY` | Google AI Studio の API キー | https://aistudio.google.com/ |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトURL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Supabase Dashboard > Settings > API > Legacy API Keys |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key | Supabase Dashboard > Settings > API > Legacy API Keys |

**重要：**
- Supabase のキーは **Legacy API Keys** タブからJWT形式のものを使用すること（`sb_publishable_*` / `sb_secret_*` 形式は `@supabase/supabase-js` と互換性なし）
- 環境変数を変更したら必ず **Redeploy** が必要

---

## Supabase セットアップ

### 1. プロジェクト作成
1. https://supabase.com でプロジェクト作成
2. Region: Northeast Asia (Tokyo) 推奨

### 2. テーブル作成
Supabase Dashboard > SQL Editor で以下を順に実行：

```bash
# 1. テーブル・インデックス・RLS・Storageバケット作成
supabase/001_create_tables.sql

# 2. シードデータ投入（デモユーザー・プロンプトテンプレート）
supabase/002_seed_data.sql
```

**注意：** SQL Editorで日本語を含むSQLを実行する際、エンコーディングの問題が発生する場合があります。その場合は Node.js スクリプトで `@supabase/supabase-js` を使って直接データ投入してください。

### 3. 作成されるリソース

**テーブル（7つ）：**
- `users` - ユーザーアカウント
- `chat_sessions` - チャットセッション
- `messages` - チャット履歴
- `generated_images` - 生成画像メタデータ
- `prompt_templates` - AIプロンプト管理
- `reference_images` - 管理者参考画像
- `api_usage_logs` - API使用ログ

**Storageバケット（3つ）：**
- `generated` - AI生成画像（公開）
- `references` - 管理者参考画像（公開）
- `uploads` - ユーザーアップロード画像（公開）

---

## デプロイ手順

### 通常のデプロイ（コード変更時）
1. ローカルでコード変更
2. `npm run build` でビルド確認
3. `git add` → `git commit` → `git push origin main`
4. Vercel が自動でデプロイ（約1分）

### 環境変数の変更時
1. Vercel > Settings > Environment Variables で値を変更
2. Deployments > 最新の「...」> **Redeploy**
3. 「Use existing Build Cache」のチェックを **外す**
4. Redeploy をクリック

---

## トラブルシューティング

### よくあるエラーと対処法

#### 1. Vercel で push しても新しいコードが反映されない
- **原因：** GitHub アカウントが Vercel チームに紐づいていない
- **対処：** リポジトリを public にするか、Vercel の Authentication Settings で GitHub アカウントを接続

#### 2. API ルート（/api/chat）が 404 になる
- **原因：** Next.js のバージョン互換性の問題
- **対処：** Next.js 15 系を使用する

#### 3. ESLint エラーでビルドが失敗
- **対処：** `eslint-config-next` のバージョンを Next.js と揃える

#### 4. Gemini API が「First content should be with role 'user'」エラー
- **原因：** チャット履歴の最初が AI メッセージになっている
- **対処：** API に送信する履歴から最初の AI メッセージを除外する

#### 5. Gemini API が「Invalid value at 'system_instruction'」エラー
- **対処：** `{ role: "user", parts: [{ text: "..." }] }` 形式で渡す

#### 6. Gemini API が 429 Too Many Requests
- **対処：** 1〜2分待ってリトライ、または有料プランにアップグレード

#### 7. Supabase接続エラー
- **原因：** 環境変数のキー形式が不正
- **対処：** Legacy API Keys タブからJWT形式のキーを使用しているか確認

---

## 開発環境セットアップ

```bash
# 依存関係インストール
npm install

# .env.local を作成（初回のみ）
# AUTH_SECRET, GEMINI_API_KEY, Supabase関連の値を設定

# 開発サーバー起動
npm run dev

# ビルド確認
npm run build
```

---

## 重要な注意事項

- `.env.local` は `.gitignore` に含まれているため GitHub にはプッシュされない
- API キーは定期的にローテーション（再生成）することを推奨
- デモアカウント: `demo@menucraft.jp` / `demo1234`（user）、`admin@menucraft.jp` / `admin1234`（admin）
