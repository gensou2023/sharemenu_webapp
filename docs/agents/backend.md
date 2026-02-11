# バックエンドエージェント

## 役割

MenuCraft AI の API ルート、データベース操作、認証、外部サービス連携を担当する。

## 担当領域

- Next.js API Routes（Route Handlers）
- Supabase (PostgreSQL + Storage) 操作
- NextAuth.js 認証フロー
- Google Gemini AI 連携
- レート制限・API ログ
- ミドルウェア

## 技術スタック

| 項目 | 技術 | 備考 |
|------|------|------|
| API | Next.js Route Handlers | `src/app/api/` |
| DB | Supabase PostgreSQL | 7 テーブル |
| Storage | Supabase Storage | 3 バケット |
| 認証 | NextAuth.js v5 | Credentials プロバイダ |
| AI | Google Gemini 2.0 Flash | `@google/genai` |
| 画像処理 | sharp | リサイズ・圧縮 |
| パスワード | bcryptjs | ハッシュ化 |

## API アーキテクチャ

### エンドポイント一覧（16本）

**公開 API:**
| パス | メソッド | 認証 | 概要 |
|------|---------|------|------|
| `/api/auth/[...nextauth]` | ALL | - | NextAuth ハンドラ |
| `/api/signup` | POST | - | ユーザー登録 |

**認証必須 API:**
| パス | メソッド | レート制限 | 概要 |
|------|---------|-----------|------|
| `/api/chat` | POST | 5/分 | Gemini チャット |
| `/api/generate-image` | POST | 50/日 | 画像生成 |
| `/api/upload-image` | POST | - | 画像アップロード |
| `/api/sessions` | GET/POST | - | セッション一覧・作成 |
| `/api/sessions/[id]` | PATCH/DELETE | - | セッション更新・削除 |
| `/api/sessions/[id]/messages` | GET/POST | - | メッセージ取得・保存 |
| `/api/dashboard` | GET | - | ダッシュボード統計 |
| `/api/images` | POST | - | Storage 保存 |
| `/api/account` | GET/PATCH | - | アカウント情報 |

**管理者 API（admin ロール必須）:**
| パス | メソッド | 概要 |
|------|---------|------|
| `/api/admin/stats` | GET | 統計データ（312行 — 要リファクタリング） |
| `/api/admin/sessions` | GET | セッション一覧 |
| `/api/admin/prompts` | GET/POST | プロンプトテンプレート管理 |
| `/api/admin/references` | GET/POST | 参照画像管理 |
| `/api/admin/api-logs` | GET | API ログ閲覧 |

### 認証フロー

```
1. ユーザーがメール/パスワードを送信
2. NextAuth Credentials プロバイダで検証
3. Supabase users テーブルと照合
4. bcrypt でパスワード検証（平文からの自動アップグレード機能あり）
5. JWT トークン発行（id, role を含む）
6. middleware.ts で保護パスをチェック
```

**ミドルウェア（`src/middleware.ts`）:**
- `/dashboard/*`, `/chat/*` → 未認証なら `/login` にリダイレクト
- `/admin/*` → admin ロール以外は `/dashboard` にリダイレクト
- `/login`, `/signup` → ログイン済みなら `/dashboard` にリダイレクト

### レート制限（`src/lib/rate-limiter.ts`）

| 種別 | 上限 | ウィンドウ |
|------|------|-----------|
| chat | 5 リクエスト | 1 分 |
| generate-image | 50 リクエスト | 1 日 |

**注意:** インメモリ実装のため、サーバー再起動でリセットされる

### API ロガー（`src/lib/api-logger.ts`）

全 API リクエストを `api_usage_logs` テーブルに記録:
- user_id, api_type, status, response_time

## データベース

### テーブル構成

```sql
users (id, email, name, role, password_hash, plan, created_at, updated_at)
chat_sessions (id, user_id, title, status, shop_name, category, created_at, updated_at)
messages (id, session_id, role, content, proposal_json, created_at)
generated_images (id, session_id, user_id, storage_path, prompt, aspect_ratio, proposal_json, created_at)
prompt_templates (id, name, content, version, is_active, updated_by, created_at, updated_at)
reference_images (id, url, category, created_at)
api_usage_logs (id, user_id, api_type, status, response_time, created_at)
```

### Supabase クライアント（`src/lib/supabase.ts`）

```typescript
// 公開クライアント（クライアントサイド用）
supabase = createClient(url, anonKey)

// サービスロールクライアント（サーバーサイド用 — RLS バイパス）
supabaseAdmin = createClient(url, serviceRoleKey)
```

### Storage バケット

| バケット | 用途 | アクセス |
|---------|------|---------|
| `generated` | AI 生成画像 | ユーザー別パス |
| `references` | 管理者参照画像 | admin のみアップロード |
| `uploads` | ユーザーアップロード画像 | ユーザー別パス |

### マイグレーション

`supabase/migrations/` に SQL ファイル:
- 初期スキーマ作成
- シードデータ

## プロンプト管理（`src/lib/prompt-loader.ts`）

- DB の `prompt_templates` テーブルから活性プロンプトを読み込み
- 30 分間キャッシュ（TTL）
- DB にない場合はハードコードのフォールバック使用

**注意:** 管理画面でプロンプト更新後、キャッシュが切れるまで反映されない

## 既知の技術的負債

| 項目 | 優先度 | 詳細 |
|------|--------|------|
| admin 認証チェック重複 | HIGH | 5 ルートで同じコードをコピペ → `withAdminAuth` ミドルウェア化 |
| レート制限がインメモリ | MEDIUM | 本番ではデプロイ間でリセット → Redis 等に移行検討 |
| プロンプトキャッシュ無効化 | LOW | 管理画面更新時に即反映されない → revalidate 導入 |
| RLS 未設定 | MEDIUM | Supabase RLS に依存せず NextAuth サーバーサイドチェックで対応中 |
| admin/stats 312行 | MEDIUM | calcChange, groupByDay 等を lib に抽出 |

## リファクタリング計画

### admin 認証ミドルウェア（最優先）

```typescript
// 現在（5箇所で重複）
const session = await auth();
if (session?.user?.role !== "admin") {
  return NextResponse.json({ error: "権限がありません" }, { status: 403 });
}

// 提案: lib/admin-auth.ts
export function withAdminAuth(handler: AuthHandler) {
  return async (req: NextRequest) => {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }
    return handler(req, session);
  };
}
```

### レート制限ミドルウェア

```typescript
// 現在（chat と generate-image で重複）
// 提案: withRateLimit(type, handler) ラッパー
```

## 環境変数

```
AUTH_SECRET=<ランダム文字列>
GEMINI_API_KEY=<Google AI Studio キー>
NEXT_PUBLIC_SUPABASE_URL=<Supabase URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase Anon Key>
SUPABASE_SERVICE_ROLE_KEY=<Supabase Service Role Key>
NEXT_PUBLIC_DEMO_MODE=true  # 開発用デモモード
```
