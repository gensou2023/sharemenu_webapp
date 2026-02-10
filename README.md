# MenuCraft AI

> AIがSNS最適サイズのメニュー画像を自動生成。飲食店オーナーのためのデザインツール。

## Overview

MenuCraft AI は、飲食店オーナー向けのAIメニュー画像生成サービスです。
チャット形式でAIと対話するだけで、プロ品質のメニュー画像を複数サイズ（1:1 / 9:16 / 16:9 / 3:4 / 4:3）で生成できます。

### 主な機能
- **チャットでヒアリング** - 店名・業態・メニュー・価格をAIが5ステップで自然にヒアリング
- **デザイン方向性の選択** - ナチュラル・和モダン・ポップなど6つの方向性からワンタップ選択
- **5サイズ画像生成** - Instagram フィード / ストーリー / X投稿 / ポートレート / スタンダード
- **即ダウンロード** - 生成された画像をワンクリック・一括ダウンロード
- **セッション管理** - 過去のセッション復元・削除・履歴閲覧
- **管理画面** - プロンプト管理・セッション閲覧・参考画像・APIログ
- **ダッシュボード** - セッション履歴・統計・画像一括DL
- **アカウント設定** - プロフィール編集・プラン情報・セキュリティ
- **無料プラン制限** - 月3セッション制限（古いセッション削除で続行可能）
- **モバイル対応** - ハンバーガーメニュー・レスポンシブUI

### 料金プラン（デモ段階）
| プラン | 料金 | 内容 |
|--------|------|------|
| Free | 無料 | 月3セッション、基本テンプレート、広告あり |
| Pro | ¥700/月 | 無制限セッション、全テンプレート、広告なし |

---

## Tech Stack

| 技術 | バージョン | 用途 |
|------|-----------|------|
| [Next.js](https://nextjs.org) | 15.x | フレームワーク（App Router） |
| [React](https://react.dev) | 19.x | UIライブラリ |
| [TypeScript](https://www.typescriptlang.org) | 5.x | 型安全 |
| [Tailwind CSS](https://tailwindcss.com) | 4.x | スタイリング（@theme inline） |
| [NextAuth.js](https://authjs.dev) | 5.x (beta) | 認証（Credentials） |
| [Google Gemini](https://ai.google.dev) | 2.0 Flash | AIチャット・画像生成 |
| [Supabase](https://supabase.com) | - | DB（PostgreSQL）・Storage・認証連携 |
| [sharp](https://sharp.pixelplumbing.com) | 0.34.x | 画像リサイズ・圧縮 |
| [DOMPurify](https://github.com/cure53/DOMPurify) | 3.x | HTMLサニタイズ |

### フォント
- **Playfair Display** - 見出し・ブランドロゴ
- **Noto Sans JP** - 本文・UI要素

---

## Getting Started

### 前提条件
- Node.js 18.x 以上
- npm 9.x 以上
- Supabase プロジェクト（テーブル作成済み）

### インストール & 起動

```bash
# 依存パッケージのインストール
npm install

# .env.local を作成
cp .env.local.example .env.local
# AUTH_SECRET, GEMINI_API_KEY, Supabase関連の値を設定

# 開発サーバーの起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### 環境変数

| Key | 説明 |
|-----|------|
| `AUTH_SECRET` | NextAuth の暗号化キー |
| `GEMINI_API_KEY` | Google AI Studio の API キー |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key（JWT形式） |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key（JWT形式） |

### ビルド

```bash
npm run build
npm start
```

---

## Project Structure

```
menucraft-web/
├── src/
│   ├── app/
│   │   ├── globals.css              # Tailwind v4 デザイントークン
│   │   ├── layout.tsx               # ルートレイアウト（フォント・メタ）
│   │   ├── page.tsx                 # ランディングページ
│   │   ├── chat/page.tsx            # AIチャット + 画像生成
│   │   ├── dashboard/page.tsx       # ダッシュボード（履歴・統計・削除）
│   │   ├── settings/page.tsx        # アカウント設定
│   │   ├── login/page.tsx           # ログイン
│   │   ├── signup/page.tsx          # ユーザー登録
│   │   ├── admin/                   # 管理画面
│   │   │   ├── page.tsx             # 管理ダッシュボード
│   │   │   ├── sessions/page.tsx    # セッション管理
│   │   │   ├── prompts/page.tsx     # プロンプトテンプレート編集
│   │   │   ├── references/page.tsx  # 参考画像管理
│   │   │   └── api-logs/page.tsx    # APIログ閲覧
│   │   └── api/
│   │       ├── auth/                # NextAuth 認証
│   │       ├── account/route.ts     # アカウント情報 (GET/PATCH)
│   │       ├── chat/route.ts        # Gemini チャットAPI
│   │       ├── generate-image/      # Gemini 画像生成API
│   │       ├── upload-image/        # 画像アップロード
│   │       ├── sessions/            # セッションCRUD + DELETE
│   │       ├── dashboard/route.ts   # ダッシュボードデータ
│   │       ├── images/route.ts      # 画像保存
│   │       └── admin/               # 管理API群
│   ├── components/
│   │   ├── landing/                 # LP コンポーネント
│   │   │   ├── Header.tsx           # ヘッダー（ハンバーガーメニュー対応）
│   │   │   ├── HeroSection.tsx      # ヒーローセクション
│   │   │   ├── HowItWorksSection.tsx # 使い方3ステップ
│   │   │   ├── CasesSection.tsx     # 導入事例
│   │   │   ├── UseCasesSection.tsx   # 活用シーン
│   │   │   ├── PricingSection.tsx   # 料金プラン
│   │   │   └── FooterSection.tsx    # フッター
│   │   ├── chat/                    # チャットUI
│   │   │   ├── ChatInput.tsx        # 入力欄（Enter送信）
│   │   │   ├── ChatMessage.tsx      # メッセージ（quickReply対応）
│   │   │   └── PreviewPanel.tsx     # プレビューパネル
│   │   ├── AdPlaceholder.tsx        # 広告プレースホルダー
│   │   ├── PlanLimitModal.tsx       # プラン制限モーダル
│   │   └── DeleteConfirmModal.tsx   # 削除確認モーダル
│   ├── hooks/
│   │   ├── useChatSession.ts        # チャットロジック（カスタムフック）
│   │   └── useOnlineStatus.ts       # オフライン検知
│   ├── lib/
│   │   ├── supabase.ts              # Supabase クライアント
│   │   └── database.types.ts        # DB型定義
│   ├── auth.ts                      # NextAuth 設定
│   └── middleware.ts                # 認証ミドルウェア
├── supabase/
│   ├── 001_create_tables.sql        # テーブル作成
│   └── 002_seed_data.sql            # シードデータ
├── docs/
│   ├── product-plan.md              # プロダクト企画書
│   ├── requirements_v2.md           # 要件定義書
│   └── deployment-guide.md          # デプロイガイド
├── WORK_LOG.md                      # 作業記録
└── package.json
```

---

## Database (Supabase)

### テーブル構成

| テーブル | 用途 |
|---------|------|
| `users` | ユーザーアカウント（email, password_hash, role） |
| `chat_sessions` | チャットセッション（店名, ステータス） |
| `messages` | チャット履歴（セッション別） |
| `generated_images` | 生成画像メタデータ + Storage連携 |
| `prompt_templates` | AIプロンプト管理（バージョン管理） |
| `reference_images` | 管理者参考画像 |
| `api_usage_logs` | API使用ログ |

### Storage バケット

| バケット | 用途 |
|---------|------|
| `generated` | AI生成画像 |
| `references` | 管理者参考画像 |
| `uploads` | ユーザーアップロード画像 |

---

## Design System

### Color Palette

| 名前 | 値 | 用途 |
|------|-----|------|
| Cream | `#FAF7F2` | メイン背景 |
| Dark | `#1A1714` | ヘッダー・フッター |
| Warm Brown | `#C4713B` | CTA・アクセント |
| Gold | `#D4A853` | ロゴ・ハイライト |
| Olive | `#7B8A64` | バッジ・タグ |

---

## API Endpoints（16個）

| エンドポイント | メソッド | 機能 |
|---------------|---------|------|
| `/api/auth/[...nextauth]` | ALL | 認証 |
| `/api/signup` | POST | ユーザー登録 |
| `/api/account` | GET/PATCH | アカウント情報 |
| `/api/chat` | POST | AIチャット |
| `/api/generate-image` | POST | 画像生成 |
| `/api/upload-image` | POST | 画像アップロード |
| `/api/sessions` | GET/POST | セッション一覧・作成 |
| `/api/sessions/[id]` | PATCH/DELETE | セッション更新・削除 |
| `/api/sessions/[id]/messages` | GET/POST | メッセージ取得・保存 |
| `/api/dashboard` | GET | ダッシュボード統計 |
| `/api/images` | POST | 画像Storage保存 |
| `/api/admin/stats` | GET | 管理統計 |
| `/api/admin/sessions` | GET | セッション一覧（管理用） |
| `/api/admin/prompts` | GET/POST | プロンプト管理 |
| `/api/admin/references` | GET/POST | 参考画像管理 |
| `/api/admin/api-logs` | GET | APIログ閲覧 |

---

## Demo Accounts

| メール | パスワード | ロール |
|--------|-----------|--------|
| `demo@menucraft.jp` | `demo1234` | user |
| `admin@menucraft.jp` | `admin1234` | admin |

---

## Pages（14ページ）

| パス | ページ | 認証 |
|------|-------|------|
| `/` | ランディングページ | 不要 |
| `/login` | ログイン | 不要 |
| `/signup` | ユーザー登録 | 不要 |
| `/forgot-password` | パスワードリセット | 不要 |
| `/chat` | AIチャット + 画像生成 | 必要 |
| `/dashboard` | ダッシュボード | 必要 |
| `/settings` | アカウント設定 | 必要 |
| `/admin` | 管理ダッシュボード | admin |
| `/admin/sessions` | セッション管理 | admin |
| `/admin/prompts` | プロンプト管理 | admin |
| `/admin/references` | 参考画像管理 | admin |
| `/admin/api-logs` | APIログ | admin |
| `/terms` | 利用規約 | 不要 |
| `/privacy` | プライバシーポリシー | 不要 |

---

## Documents

| ドキュメント | 内容 |
|-------------|------|
| [プロダクト企画書](docs/product-plan.md) | ビジョン・ペルソナ・ロードマップ等（12部構成） |
| [要件定義書](docs/requirements_v2.md) | 機能要件・非機能要件・画面構成 |
| [デプロイガイド](docs/deployment-guide.md) | Vercel + Supabase 環境構築手順 |
| [作業記録](WORK_LOG.md) | 開発フェーズ・実装詳細・確認結果 |

---

## Development Status

### GitHub Issues: 全30件クローズ済み ✅

| カテゴリ | Issue番号 | 状態 |
|---------|----------|------|
| MVP機能 | #1〜#8 | ✅ 完了 |
| リファクタリング | #9〜#16 | ✅ 完了 |
| 管理・連携 | #20〜#21 | ✅ 完了 |
| バグ修正・UX改善 | #22〜#24 | ✅ 完了 |
| 新機能追加 | #25〜#29 | ✅ 完了 |
| デザイン改善 | #30 | ✅ 完了 |

---

## Deployment

- **本番URL**: https://sharemenu-webapp.vercel.app
- **リポジトリ**: https://github.com/gensou2023/sharemenu_webapp
- **ホスティング**: Vercel（Hobby プラン）
- **DB**: Supabase（Free プラン）

詳細は [デプロイガイド](docs/deployment-guide.md) を参照。

---

## License

Private - All rights reserved.
