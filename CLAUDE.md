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
- コミットメッセージ: `feat:` / `fix:` / `design:` / `docs:` / `refactor:` / `test:`

## ディレクトリ構成

```
src/
├── app/
│   ├── api/              # 16 API エンドポイント
│   ├── admin/            # 管理画面（5ページ）
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
│   └── useOnlineStatus.ts
├── lib/
│   ├── supabase.ts       # Supabase クライアント
│   ├── types.ts          # 型定義
│   ├── rate-limiter.ts   # レート制限
│   ├── api-logger.ts     # APIログ
│   └── prompt-loader.ts  # プロンプトテンプレート
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

## API エンドポイント（16本）

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
| `/api/admin/*` | GET/POST | 管理系 API（stats, sessions, prompts, references, api-logs） |

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
| useChatSession.ts | HIGH | 688行・10責務 → 4フックに分割必要 |
| dashboard/page.tsx | HIGH | 553行 → コンポーネント分離必要 |
| admin 認証チェック | HIGH | 5箇所重複 → ミドルウェア化 |
| login/signup レイアウト | MEDIUM | 重複 → AuthLayout 共通化 |
| テストコード | HIGH | 現在ゼロ → API + 統合テスト必要 |

## 次回セッションのタスク

1. **リファクタリング（HIGH）** — useChatSession分割、dashboard分割、admin認証ミドルウェア
2. **画像アップロード機能** — チャットの📎ボタン実装
3. **テストコード追加** — API ルート + 統合テスト
4. **設定/ログイン/サインアップ デザインリフレッシュ** — Phase A-C パターン適用
5. **管理画面 デザインリフレッシュ**
6. **SEO/OGP 対応** — meta タグ、OG 画像、構造化データ

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
