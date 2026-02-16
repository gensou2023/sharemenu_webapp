# 多言語対応（i18n）調査レポート

作成日: 2026-02-16

## 1. エグゼクティブサマリー

MenuCraft AI は現在 **日本語のみ** で運用されており、ハードコードされた日本語文字列が **約 280〜320 件**、対象ファイルは **75 ファイル** に分散している。多言語対応（日本語 + 英語）の実装には、ライブラリ導入 + ディレクトリ再構成 + 文字列抽出が必要で、**実装工数は約 20〜30 時間** と見積もる。

**推奨ライブラリ:** `next-intl` v4.x（Next.js 15 App Router にネイティブ対応、Server Components サポート）

---

## 2. 影響範囲の全体像

### 2.1 日本語文字列を含むファイル数

| カテゴリ | ファイル数 | 文字列数（概算） | 主な内容 |
|---------|-----------|-----------------|---------|
| ページ (`src/app/**/page.tsx`) | 25 | ~113 | UI テキスト、SEO メタデータ、法的文書 |
| レイアウト (`src/app/**/layout.tsx`) | 2 | ~8 | メタデータ、ナビゲーション |
| 共通コンポーネント (`src/components/**`) | 50 | ~120+ | ラベル、CTA、フォーム、モーダル |
| API ルート (`src/app/api/**`) | ~10 | ~15+ | エラーメッセージ、バリデーション |
| Lib (`src/lib/**`) | 2 | ~7 | 挨拶文、パスワード検証 |
| Hooks (`src/hooks/**`) | 0 | 0 | 日本語なし |
| **合計** | **~75** | **~280-320** | |

### 2.2 特に影響が大きいファイル（上位 10）

| ファイル | 文字列数 | 種類 |
|---------|---------|------|
| `settings/ProfileSection.tsx` | 15 + 47都道府県 | フォームラベル、選択肢 |
| `app/tokushoho/page.tsx` | 22 | 法的文書（特商法） |
| `landing/PricingSection.tsx` | 15 | 料金プラン表 |
| `app/privacy/page.tsx` | 15 | 法的文書 |
| `app/terms/page.tsx` | 14 | 法的文書 |
| `landing/CasesSection.tsx` | 12 | 導入事例 |
| `landing/FooterSection.tsx` | 10 | フッターリンク |
| `PlanLimitModal.tsx` | 10 | プラン制限モーダル |
| `app/gallery/page.tsx` | 8 | タブ、ソート、空状態 |
| `app/chat/page.tsx` | 8 | モード、ローディング |

### 2.3 特殊な考慮事項

#### 動的テキスト
```
src/lib/greeting.ts
  - 時間帯挨拶: "おはようございます" / "こんにちは" / "こんばんは"
  - 統計メッセージ: "今月 {count}枚 のメニュー画像を作成しました"
  - 助数詞: 枚, 件, セッション（英語には対応概念なし）
```

#### 日付・通貨フォーマット
```
- toLocaleDateString("ja-JP") → ロケール切替で対応可能
- ¥0 / ¥700 → 通貨記号の切替が必要
- "¥0 / 月" → "¥0 / mo" 等
```

#### フォント
```
現状: Noto Sans JP（~100-150KB）が全ユーザーに読み込まれる
対策: ロケールに応じた条件付きフォント読み込みを検討
英語: Playfair Display + システムサンスセリフ（読み込み済み）
```

#### SEO メタデータ
```
- <html lang="ja"> がハードコード
- OG タグ（locale: "ja_JP"）がハードコード
- hreflang タグが未設定
```

#### 法的ページ
```
- tokushoho（特定商取引法）は日本固有の法的要件 → 英訳不要の可能性
- terms / privacy は英訳必須
```

---

## 3. ライブラリ比較

### 3.1 比較表

| ライブラリ | App Router | Server Components | セットアップ | コミュニティ | 推奨度 |
|-----------|-----------|-------------------|------------|------------|-------|
| **next-intl** | ネイティブ対応 | ネイティブ対応 | 低 | 非常に大 | **推奨** |
| react-i18next | プラグイン経由 | ワークアラウンド要 | 中〜高 | 大 | 次点 |
| react-intl | 部分的 | ワークアラウンド要 | 中〜高 | 大 | 非推奨 |
| next-i18next | **非対応** | N/A | N/A | レガシー | **不可** |
| Next.js 組込み | **App Router なし** | N/A | N/A | N/A | 不可 |
| Intlayer | 対応 | 対応 | 中 | 小 | 要観察 |

### 3.2 next-intl を推奨する理由

1. **Next.js 15 App Router 専用設計** — Server/Client Components 両方で `useTranslations` が動作
2. **React 19 完全対応** — ピア依存宣言済み
3. **TypeScript 型安全** — 翻訳キーの自動型生成
4. **週間 DL 数 ~150万** — 十分な実績
5. **NextAuth v5 との統合パターンが確立** — コミュニティで検証済み
6. **セットアップがシンプル** — 6〜8 ファイルの変更で導入可能

### 3.3 next-i18next が使えない理由

next-i18next は **Pages Router 専用** であり、App Router では動作しない。メンテナ自身が react-i18next への移行を推奨している。

---

## 4. 推奨アーキテクチャ

### 4.1 ルーティング戦略

**推奨: `localePrefix: 'as-needed'`（デフォルトロケールは prefix なし）**

```
日本語（デフォルト）: /dashboard, /chat, /login
英語:               /en/dashboard, /en/chat, /en/login
```

**理由:**
- 既存の日本語ユーザーの URL が変わらない（破壊的変更なし）
- 英語ユーザーには明示的な `/en/` prefix で SEO 対応
- `tokushoho` 等の日本語固有ページは英語 prefix 不要

### 4.2 ディレクトリ構成（変更後）

```
menucraft-web/
├── messages/
│   ├── ja.json              # 日本語翻訳（~280キー）
│   └── en.json              # 英語翻訳
├── src/
│   ├── i18n/
│   │   ├── routing.ts       # ロケール・ルーティング設定
│   │   └── request.ts       # サーバー側メッセージ読込
│   ├── app/
│   │   ├── [locale]/        # ★ 全ページをここに移動
│   │   │   ├── layout.tsx   # NextIntlClientProvider + <html lang>
│   │   │   ├── page.tsx     # LP
│   │   │   ├── dashboard/
│   │   │   ├── chat/
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── settings/
│   │   │   ├── admin/
│   │   │   ├── gallery/
│   │   │   ├── release-notes/
│   │   │   ├── terms/
│   │   │   ├── privacy/
│   │   │   └── tokushoho/   # 日本語のみ？
│   │   └── api/             # API は [locale] の外に残す
│   └── middleware.ts         # next-intl + NextAuth 統合
```

### 4.3 翻訳ファイル構造（名前空間ベース）

```json
// messages/ja.json
{
  "Common": {
    "loading": "読み込み中...",
    "save": "保存",
    "cancel": "キャンセル",
    "delete": "削除"
  },
  "Auth": {
    "login": "ログイン",
    "email": "メールアドレス",
    "password": "パスワード",
    "forgotPassword": "パスワードをお忘れですか？",
    "loginError": "メールアドレスまたはパスワードが正しくありません"
  },
  "Dashboard": { ... },
  "Chat": { ... },
  "Landing": { ... },
  "Settings": { ... },
  "Admin": { ... },
  "Metadata": {
    "title": "MenuCraft AI - チャットするだけでプロ品質のメニューを",
    "description": "AIがSNS最適サイズのメニュー画像を自動生成。"
  }
}
```

### 4.4 ミドルウェア統合パターン

現在の `middleware.ts`:
```ts
export { auth as middleware } from "@/auth";
```

変更後（next-intl + NextAuth v5 統合）:
```ts
import createMiddleware from 'next-intl/middleware';
import { auth } from '@/auth';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
  // 認証チェック → intl ミドルウェア実行
  return intlMiddleware(req);
});
```

### 4.5 Server / Client Components での使い分け

**Server Components（デフォルト）:**
```tsx
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  return <h1>{t('title')}</h1>; // JS バンドルに含まれない
}
```

**Client Components（"use client"）:**
```tsx
"use client";
import { useTranslations } from 'next-intl';

export default function ChatInput() {
  const t = useTranslations('Chat');
  return <input placeholder={t('inputPlaceholder')} />;
  // NextIntlClientProvider が必要（layout で設定）
}
```

---

## 5. 実装フェーズ案

### Phase 1: 基盤構築（4〜6 時間）
- `npm install next-intl`
- `src/i18n/routing.ts`, `src/i18n/request.ts` 作成
- `next.config.ts` に next-intl プラグイン追加
- `src/app/` → `src/app/[locale]/` へディレクトリ再構成
- `middleware.ts` を next-intl + NextAuth 統合に変更
- `layout.tsx` に `NextIntlClientProvider` 追加、`<html lang>` 動的化
- `messages/ja.json`, `messages/en.json` の空ファイル作成

### Phase 2: 共通 UI 文字列の抽出（4〜6 時間）
- Common（ボタン、ラベル、ローディング）
- Auth（ログイン、サインアップ、パスワード忘れ）
- ナビゲーション（Header, Sidebar, Footer）
- モーダル（PlanLimitModal, DeleteConfirmModal）

### Phase 3: 機能ページ文字列の抽出（6〜8 時間）
- Dashboard（統計、セッションカード、挨拶）
- Chat（入力、メッセージ、プレビュー）
- Settings（プロフィール、セキュリティ、通知、業種/都道府県）
- Gallery（タブ、ソート、共有モーダル）
- Admin（全9ページ）

### Phase 4: LP・法的ページ・SEO（4〜6 時間）
- Landing（8 セクション: Hero, Features, HowItWorks, Pricing, Cases, UseCases, CTA, Footer）
- Terms / Privacy（英訳）
- Tokushoho（日本語のみ対応の判断）
- SEO メタデータ（hreflang, OG タグ）
- sitemap.xml のロケール対応

### Phase 5: 仕上げ・検証（3〜5 時間）
- API エラーメッセージの i18n（キーベース返却 or Accept-Language ヘッダ判定）
- 動的テキスト（挨拶、統計メッセージ）の i18n
- フォント読み込み最適化
- 言語切替 UI の実装（ヘッダー or 設定画面）
- 全ページ英語表示テスト
- ビルド・テスト検証

---

## 6. 工数見積

| 項目 | 工数 |
|-----|------|
| 基盤構築 + ディレクトリ再構成 | 4〜6h |
| 文字列抽出（~280 キー） | 14〜20h |
| 英語翻訳 QA | 別途（外部 or AI 支援） |
| 言語切替 UI + 検証 | 3〜5h |
| **合計** | **21〜31h** |

---

## 7. リスク・注意点

### 高リスク
| リスク | 影響 | 対策 |
|-------|------|------|
| ディレクトリ再構成 | 全ページの import パスが変わる可能性 | 段階的移行、ビルド確認を頻繁に |
| NextAuth v5 との統合 | middleware 競合の可能性 | 確立済みパターンを使用 |
| SEO 影響 | URL 変更による検索順位変動 | `as-needed` でデフォルト URL を維持 |

### 中リスク
| リスク | 影響 | 対策 |
|-------|------|------|
| 翻訳漏れ | 日英混在表示 | TypeScript 型安全で検出 |
| 動的テキストの助数詞 | 「3枚」→「3 images」 | ICU メッセージフォーマット使用 |
| フォントサイズ | 英語ユーザーに不要な日本語フォント | 条件付き読み込み |

### 低リスク
| リスク | 影響 | 対策 |
|-------|------|------|
| フォームラベル翻訳 | 単純な置換 | 機械的に対応可能 |

---

## 8. 判断が必要な項目

実装前に決めるべき事項:

1. **tokushoho（特商法）ページは英訳するか？** — 日本法固有のため不要の可能性
2. **Admin 画面は多言語対応するか？** — 管理者は日本人限定なら不要
3. **API エラーメッセージの i18n 方式** — キーベース vs Accept-Language ヘッダ
4. **言語切替 UI の配置** — ヘッダー vs 設定画面 vs フッター
5. **DB に `locale` カラムを追加するか？** — `user_settings` テーブルに追加
6. **英語翻訳の担当** — 手動 vs AI 支援 vs 外部翻訳サービス

---

## 9. 参考リソース

- [next-intl 公式ドキュメント](https://next-intl.dev/docs/getting-started/app-router)
- [Next.js 公式 i18n ガイド](https://nextjs.org/docs/app/guides/internationalization)
- [NextAuth v5 + next-intl Middleware 統合](https://github.com/amannn/next-intl/issues/596)
- [Auth.js v5 Middleware Chaining](https://github.com/nextauthjs/next-auth/discussions/8961)
