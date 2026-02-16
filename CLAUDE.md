# MenuCraft AI — プロジェクトガイド

## プロジェクト概要

MenuCraft AI は、飲食店オーナー向けの AI メニュー画像自動生成 SaaS。
チャット形式で店舗情報やメニューを伝えると、SNS 最適サイズの画像を自動生成する。

- **本番 URL:** https://sharemenu-webapp.vercel.app
- **リポジトリ:** https://github.com/gensou2023/sharemenu_webapp

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フレームワーク | Next.js 15 (App Router) |
| UI | React 19 + TypeScript |
| スタイル | Tailwind CSS v4 (`@theme inline` in globals.css) |
| 認証 | NextAuth.js v5 (Credentials) |
| DB | Supabase PostgreSQL + Storage |
| AI | Google Gemini 2.0 Flash (`@google/genai`) |
| 画像処理 | sharp |
| チャート | recharts |
| デプロイ | Vercel |

## ブランチ戦略

```
main        ← 本番安定ブランチ
 └─ develop ← 統合ブランチ（通常はここで作業）
     └─ feature/* or design/* ← 機能・デザインブランチ
```

- feature ブランチは develop にマージ
- 安定確認後 develop → main を fast-forward マージ
- **main への直接 commit は禁止**（docs 含め全て develop 経由）
- コミットメッセージ: `feat:` / `fix:` / `design:` / `docs:` / `refactor:` / `test:`

## ディレクトリ構成

```
src/
├── app/
│   ├── api/              # 24 API エンドポイント
│   ├── admin/            # 管理画面（9ページ）
│   ├── chat/             # チャット画面
│   ├── dashboard/        # ダッシュボード
│   ├── settings/         # アカウント設定
│   ├── login/ signup/    # 認証ページ
│   ├── globals.css       # デザイントークン定義
│   ├── layout.tsx        # ルートレイアウト
│   └── page.tsx          # LP（ランディングページ）
├── components/
│   ├── landing/          # LP セクション（8コンポーネント）
│   ├── chat/             # ChatInput, ChatMessage, PreviewPanel
│   ├── dashboard/        # StatsSection, HistorySection
│   └── admin/            # KpiCard, TrendChart, etc.
├── hooks/
│   ├── useChatSession.ts # チャットフロー管理（要リファクタリング）
│   ├── useDashboardData.ts # ダッシュボードデータ取得
│   ├── useSessionActions.ts # セッション操作（作成・削除・DL）
│   └── useOnlineStatus.ts
├── lib/
│   ├── supabase.ts       # Supabase クライアント
│   ├── types.ts          # 型定義
│   ├── rate-limiter.ts   # レート制限
│   ├── api-logger.ts     # APIログ
│   ├── greeting.ts       # 時間帯挨拶・統計メッセージ
│   ├── password-validation.ts # パスワード検証
│   └── prompt-loader.ts  # プロンプトテンプレート
├── __tests__/             # Vitest テスト（8ファイル, 72テスト）
├── auth.ts               # NextAuth 設定
└── middleware.ts          # 認証ミドルウェア
```

## デザインシステム

### カラートークン（globals.css で定義）

| トークン | 値 | 用途 |
|---------|-----|------|
| `accent-warm` | `#E8713A` | プライマリ CTA・ボタン |
| `accent-gold` | `#D4A853` | セカンダリアクセント |
| `accent-olive` | `#7B8A64` | バッジ・ステータス |
| `bg-primary` | `#FAFAF8` | 背景（クリーム） |
| `bg-dark` | `#1A1A1A` | ダーク背景 |
| `text-primary` | `#1A1A1A` | 本文 |
| `text-secondary` | `#6B6560` | サブテキスト |
| `border-light` | `#EEEBE6` | ボーダー |

### フォント

- 見出し・ブランド: `Playfair Display` (serif)
- 本文・UI: `Noto Sans JP` (sans-serif)

### ビジュアルパターン（Phase A〜C で確立）

| パターン | 使い方 |
|---------|--------|
| 背景ブラーサークル | `bg-accent-warm/[.03]` 〜 `bg-accent-warm/[.08]`（ページ種別で強度調整） |
| アクセントバー | カード上端に `h-[2px]` or `h-[3px]` |
| ホバー効果 | `translateY(-2px)` + `shadow` + `border-color` 変化 |
| ドットパターン | `radial-gradient` で `16px 16px` グリッド |
| 英語ラベル | セクションヘッダに "Menu Design" 等の小さいラベル |
| fadeInUp | `.animate-fade-in-up`（globals.css に定義済み） |
| rounded-full | CTA ボタン・アイコンボタンに統一 |

**強度レベル:** LP(.05-.08) > Dashboard(.04-.05) > Chat(.03)

## データベース構成

| テーブル | 用途 |
|---------|------|
| `users` | ユーザー（email, role, password_hash） |
| `chat_sessions` | チャットセッション |
| `messages` | メッセージ履歴 |
| `generated_images` | 生成画像メタデータ |
| `prompt_templates` | AI プロンプト（バージョン管理） |
| `reference_images` | 管理者参照画像 |
| `api_usage_logs` | API 利用ログ |
| `shared_images` | ギャラリー共有画像 |
| `image_likes` | いいね |
| `image_saves` | 保存 |
| `image_reports` | 通報 |
| `user_settings` | ユーザー設定（生成デフォルト等） |
| `user_achievements` | アチーブメント |
| `notification_preferences` | 通知設定 |
| `notifications` | 通知 |
| `release_notes` | リリースノート |

## API エンドポイント（24本）

| パス | メソッド | 概要 |
|------|---------|------|
| `/api/chat` | POST | Gemini チャット |
| `/api/generate-image` | POST | 画像生成 |
| `/api/upload-image` | POST | 画像アップロード |
| `/api/sessions` | GET/POST | セッション一覧・作成 |
| `/api/sessions/[id]` | PATCH/DELETE | セッション更新・削除 |
| `/api/sessions/[id]/messages` | GET/POST | メッセージ取得・保存 |
| `/api/dashboard` | GET | ダッシュボード統計 |
| `/api/images` | POST | Storage 保存 |
| `/api/account` | GET/PATCH | アカウント情報 |
| `/api/signup` | POST | ユーザー登録 |
| `/api/account/settings` | GET/PATCH | ユーザー設定（生成デフォルト） |
| `/api/account/usage` | GET | 使用状況統計 |
| `/api/achievements` | GET/PATCH | アチーブメント |
| `/api/notifications` | GET/PATCH | 通知一覧・既読処理 |
| `/api/admin/stats` | GET | 管理ダッシュボード統計 |
| `/api/admin/sessions` | GET | 管理セッション一覧 |
| `/api/admin/users` | GET | 管理ユーザー一覧 |
| `/api/admin/users/[id]` | GET | ユーザー詳細 |
| `/api/admin/moderation` | GET | モデレーション通報一覧 |
| `/api/admin/moderation/[id]` | POST | 通報アクション（削除/却下） |
| `/api/admin/revenue` | GET | 売上管理統計 |
| `/api/admin/api-logs` | GET | APIログ（フィルタ・ページネーション） |
| `/api/admin/prompts` | GET/POST | プロンプトテンプレート管理 |
| `/api/admin/references` | GET/POST | 参考画像管理 |
| `/api/admin/release-notes` | GET/POST | リリースノート管理 |
| `/api/admin/release-notes/[id]` | PATCH/DELETE | リリースノート更新・削除 |
| `/api/release-notes` | GET | 公開リリースノート一覧 |

## プラン制限

| | Free | Pro (¥700/月) |
|---|------|---------------|
| セッション/月 | 3 | 無制限 |
| 画像生成/日 | 5 | 50 |
| チャット/分 | 5 | 5 |

## デモアカウント（開発用）

| Email | Password | Role |
|-------|----------|------|
| `demo@menucraft.jp` | `demo1234` | user |
| `admin@menucraft.jp` | `admin1234` | admin |

※ `NEXT_PUBLIC_DEMO_MODE=true` 時のみ有効

## 開発コマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド（PR前に必ず実行）
npm run lint     # ESLint チェック
npm start        # 本番サーバー起動
```

## コーディング規約

- Server Components をデフォルトで使用、`"use client"` は必要な場合のみ
- パス省略形 `@/` → `src/`
- Tailwind クラスでスタイリング（CSS-in-JS 不使用）
- 日本語 UI テキスト、コメントは必要最小限
- 型定義は `src/lib/types.ts` に集約
- API エラーレスポンス: `{ error: "メッセージ" }` 形式

## 既知の技術的負債

| 項目 | 優先度 | 概要 |
|------|--------|------|
| ~~useChatSession.ts~~ | ~~HIGH~~ | DONE — 4フック分割済み（useChatFlow, useImageGeneration, useSessionPersistence, useSessionRestore） |
| ~~dashboard/page.tsx~~ | ~~HIGH~~ | DONE — コンポーネント分離済み（160行） |
| ~~admin 認証チェック~~ | ~~HIGH~~ | DONE — `withAdmin` ミドルウェア化済み |
| ~~login/signup レイアウト~~ | ~~MEDIUM~~ | DONE — AuthInput/AuthErrorMessage/AuthFooterLink 共通化済み |
| ~~テストコード~~ | ~~HIGH~~ | DONE — Vitest 基盤構築済み（8ファイル, 74テスト） |

## 次回セッションのタスク

1. **マネタイズ案B 実装** — Free(10枚/月) + Pro(¥700/月, 50枚/月) のプラン変更。DB plan カラム追加、制限ロジック変更、UI 更新（`docs/monetization-plan.md` 参照）
2. **Sprint D 計画** — #47 ダークモード（CSS影響大・事前設計必要）
3. **多言語対応（i18n）** — 調査・設計完了済み（`docs/i18n-research.md`）。Phase 3以降で本格対応

## エージェント構成

チーム開発では以下のロール MD を参照:

| ロール | ファイル | 責務 |
|--------|---------|------|
| PdO（プロダクトオーナー） | `docs/agents/pdo.md` | 要件定義、優先度判断、受入基準 |
| デザイナー | `docs/agents/designer.md` | デザインシステム、UI パターン |
| フロントエンド | `docs/agents/frontend.md` | React/Next.js 実装 |
| バックエンド | `docs/agents/backend.md` | API、DB、認証 |
| QA | `docs/agents/qa.md` | テスト、品質保証 |
| UX | `docs/agents/ux.md` | ユーザー体験、フロー設計 |
