# MenuCraft AI

> AIがSNS最適サイズのメニュー画像を自動生成。飲食店オーナーのためのデザインツール。

## Overview

MenuCraft AI は、飲食店オーナー向けのAIメニュー画像生成サービスです。
チャット形式でAIと対話するだけで、プロ品質のメニュー画像を複数サイズ（1:1 / 9:16 / 16:9）で同時に生成できます。

### 主な機能
- **チャットでヒアリング** - 料理名・価格・こだわりをAIが自然にヒアリング
- **最大3サイズ同時生成** - Instagram / ストーリー / 横長バナーに対応
- **即ダウンロード** - 生成された画像をワンクリックでダウンロード

### 料金プラン
| プラン | 料金 | 内容 |
|--------|------|------|
| Free | 無料 | 1:1のみ、1日3回まで |
| Pro | ¥700/月 | 全サイズ、生成無制限 |

---

## Tech Stack

| 技術 | バージョン | 用途 |
|------|-----------|------|
| [Next.js](https://nextjs.org) | 16.1.6 | フレームワーク（App Router） |
| [React](https://react.dev) | 19.2.3 | UIライブラリ |
| [TypeScript](https://www.typescriptlang.org) | 5.x | 型安全 |
| [Tailwind CSS](https://tailwindcss.com) | 4.x | スタイリング |

### フォント
- **Playfair Display** - 見出し・ブランドロゴ
- **Noto Sans JP** - 本文・UI要素

---

## Getting Started

### 前提条件
- Node.js 18.x 以上
- npm 9.x 以上

### インストール & 起動

```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

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
│   │   ├── globals.css          # Tailwind v4 デザイントークン
│   │   ├── layout.tsx           # ルートレイアウト（フォント・メタ）
│   │   └── page.tsx             # ランディングページ
│   └── components/
│       └── landing/
│           ├── Header.tsx       # 固定ヘッダー
│           ├── HeroSection.tsx  # ヒーローセクション
│           ├── CasesSection.tsx # 導入事例
│           ├── PricingSection.tsx # 料金プラン
│           └── FooterSection.tsx  # フッター・問い合わせ
├── docs/
│   └── product-plan.md          # プロダクト企画書
├── WORK_LOG.md                  # 作業記録
└── package.json
```

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

## Documents

| ドキュメント | 内容 |
|-------------|------|
| [プロダクト企画書](docs/product-plan.md) | ビジョン・ペルソナ・ロードマップ等（12部構成） |
| [作業記録](WORK_LOG.md) | 開発フェーズ・実装詳細・確認結果 |

---

## Roadmap

- [x] Phase 1: ランディングページ（ホーム画面）
- [ ] Phase 2: ダッシュボード画面
- [ ] Phase 3: チャット + プレビュー画面
- [ ] Phase 4: 認証機能（ログイン / サインアップ）
- [ ] Phase 5: Google Gemini API 統合
- [ ] Phase 6: レスポンシブ対応の強化

---

## License

Private - All rights reserved.
