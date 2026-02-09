# MenuCraft AI

> AIがSNS最適サイズのメニュー画像を自動生成。飲食店オーナーのためのデザインツール。

## Overview

MenuCraft AI は、飲食店オーナー向けのAIメニュー画像生成サービスです。
チャット形式でAIと対話するだけで、プロ品質のメニュー画像を複数サイズ（1:1 / 9:16 / 16:9 / 3:4 / 4:3）で生成できます。

### 主な機能
- **チャットでヒアリング** - 店名・業態・メニュー・価格をAIが5ステップで自然にヒアリング
- **5サイズ画像生成** - Instagram フィード / ストーリー / X投稿 / ポートレート / スタンダード
- **即ダウンロード** - 生成された画像をワンクリックでダウンロード
- **管理画面** - プロンプト管理・セッション閲覧・参考画像・APIログ
- **ダッシュボード** - 過去のセッション履歴・統計表示

### 料金プラン（デモ段階）
| プラン | 料金 | 内容 |
|--------|------|------|
| Free | 無料 | 1:1のみ、1日3回まで |
| Pro | ¥700/月 | 全サイズ、生成無制限 |

---

## Tech Stack

| 技術 | バージョン | 用途 |
|------|-----------|------|
| [Next.js](https://nextjs.org) | 15.5.x | フレームワーク（App Router） |
| [React](https://react.dev) | 19.x | UIライブラリ |
| [TypeScript](https://www.typescriptlang.org) | 5.x | 型安全 |
| [Tailwind CSS](https://tailwindcss.com) | 4.x | スタイリング（@theme inline） |
| [NextAuth.js](https://authjs.dev) | 5.x (beta) | 認証（Credentials） |
| [Google Gemini](https://ai.google.dev) | 2.0 Flash | AIチャット・画像生成 |
| [Supabase](https://supabase.com) | - | DB（PostgreSQL）・Storage・認証連携 |
| [sharp](https://sharp.pixelplumbing.com) | 0.34.x | 画像リサイズ・圧縮 |

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
│   │   ├── dashboard/page.tsx       # ダッシュボード
│   │   ├── login/page.tsx           # ログイン
│   │   ├── signup/page.tsx          # サインアップ（デモ無効化）
│   │   ├── admin/                   # 管理画面
│   │   │   ├── page.tsx             # 管理ダッシュボード
│   │   │   ├── sessions/page.tsx    # セッション管理
│   │   │   ├── prompts/page.tsx     # プロンプトテンプレート編集
│   │   │   ├── references/page.tsx  # 参考画像管理
│   │   │   └── api-logs/page.tsx    # APIログ閲覧
│   │   └── api/
│   │       ├── chat/route.ts        # Gemini チャットAPI
│   │       ├── generate-image/route.ts # Gemini 画像生成API
│   │       ├── upload-image/route.ts   # 画像アップロード
│   │       ├── sessions/             # セッションCRUD
│   │       ├── dashboard/route.ts     # ダッシュボードデータ
│   │       ├── images/route.ts        # 画像保存
│   │       └── admin/                 # 管理API群
│   ├── components/
│   │   ├── landing/                 # LP コンポーネント
│   │   ├── chat/                    # チャットUI
│   │   └── dashboard/               # ダッシュボードUI
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

## Demo Accounts

| メール | パスワード | ロール |
|--------|-----------|--------|
| `demo@menucraft.jp` | `demo1234` | user |
| `admin@menucraft.jp` | `admin1234` | admin |

---

## Documents

| ドキュメント | 内容 |
|-------------|------|
| [プロダクト企画書](docs/product-plan.md) | ビジョン・ペルソナ・ロードマップ等（12部構成） |
| [要件定義書](docs/requirements_v2.md) | 機能要件・非機能要件・画面構成 |
| [デプロイガイド](docs/deployment-guide.md) | Vercel + Supabase 環境構築手順 |
| [作業記録](WORK_LOG.md) | 開発フェーズ・実装詳細・確認結果 |

---

## MVP Roadmap

### 実装済み
- [x] ランディングページ（ホーム画面）
- [x] ダッシュボード画面
- [x] チャット + プレビュー画面（5ステップヒアリング）
- [x] 認証機能（ログイン / デモアカウント）
- [x] Google Gemini API 統合（チャット + 画像生成）
- [x] Supabase DB統合（7テーブル + Storage）
- [x] 管理画面（統計・セッション・プロンプト・参考画像・APIログ）
- [x] 画像アップロード（sharpリサイズ・圧縮）

### MVP残タスク（優先順）
- [ ] セッション履歴の復元（過去セッションの再開）
- [ ] API使用ログの記録実装
- [ ] プロンプトテンプレートのDB読み込み
- [ ] エラーハンドリング強化
- [ ] レート制限の実装

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
