# フロントエンドエージェント

## 役割

MenuCraft AI の React / Next.js フロントエンド実装を担当する。
コンポーネント設計、状態管理、パフォーマンス最適化を行う。

## 担当領域

- React コンポーネント実装
- ページレイアウト・ルーティング
- 状態管理（hooks、context）
- フォーム処理・バリデーション
- API 呼び出し・データフェッチ
- Tailwind CSS によるスタイリング

## 技術スタック詳細

| 項目 | 技術 | バージョン |
|------|------|-----------|
| フレームワーク | Next.js (App Router) | 15.x |
| UI | React | 19.x |
| 言語 | TypeScript | 5.x |
| CSS | Tailwind CSS v4 | `@theme inline` |
| 認証 | NextAuth.js v5 | beta.30 |
| チャート | recharts | 3.x |
| HTML サニタイズ | dompurify | 3.x |

## コンポーネント構成

### ページ（`src/app/`）

| パス | 種類 | 行数 | 備考 |
|------|------|------|------|
| `page.tsx` (LP) | Server | ~180 | 8 セクション合成 |
| `chat/page.tsx` | Client | ~200 | チャット + プレビュー |
| `dashboard/page.tsx` | Client | ~550 | **要リファクタリング** |
| `settings/page.tsx` | Client | ~220 | アカウント設定 |
| `admin/page.tsx` | Client | ~200 | 管理ダッシュボード |
| `login/page.tsx` | Client | ~150 | ログインフォーム |
| `signup/page.tsx` | Client | ~180 | 登録フォーム |

### 共有コンポーネント（`src/components/`）

**Landing:**
Header, HeroSection, FeaturesSection, HowItWorksSection, CasesSection, UseCasesSection, PricingSection, CTABannerSection, FooterSection

**Chat:**
ChatInput, ChatMessage, PreviewPanel

**Dashboard:**
StatsSection, HistorySection

**Admin:**
KpiCard, TrendChart, CompletionDonut, RecentSessionsTable, ApiHealthIndicator

**Modal:**
PlanLimitModal, DeleteConfirmModal

## カスタムフック

### `useChatSession` (688行 — 要分割)

現在の責務（過多）:
1. メッセージ状態管理
2. セッション作成・復元
3. DB 保存（messages, images）
4. Gemini API 呼び出し・レスポース解析
5. 画像生成 + オフラインチェック
6. エラー処理 + リトライ
7. カテゴリ推測
8. 提案プレビュー検出
9. 自動フォローアップ
10. 6 つのハンドラ関数

**リファクタリング計画:**
```
hooks/
├── useChatSession.ts     → コア状態管理（~250行）
├── useGeminiChat.ts      → API ロジック（~150行）
├── useImageGeneration.ts → 画像生成（~150行）
└── useSessionStorage.ts  → DB 操作（~100行）
lib/
└── chatFlow.ts           → ビジネスロジック（~120行）
```

### `useOnlineStatus`
- ブラウザのオンライン/オフライン状態を検出
- Chat ページでオフライン表示に使用

## 型定義

- `src/lib/types.ts` — Message, Proposal, GeneratedImage, FlowStep 等
- `src/lib/database.types.ts` — Supabase 自動生成型
- `src/types/next-auth.d.ts` — NextAuth 型拡張

## コーディング規約

### コンポーネント

- Server Components をデフォルトで使用
- `"use client"` は状態・イベントが必要な場合のみ
- 1ファイル 300 行以下を目標
- Props 型は同ファイル内で定義（小規模な場合）

### スタイリング

- Tailwind クラスのみ（CSS-in-JS 不使用）
- デザイントークン使用必須（ハードコード色禁止）
- レスポンシブ: `sm:` → `md:` → `lg:` の順
- `globals.css` のカスタムクラス（`.animate-fade-in-up` 等）を活用

### インポート

```typescript
// パスエイリアスを使用
import { Message } from "@/lib/types";
import { ChatInput } from "@/components/chat/ChatInput";
```

### 状態管理

- ローカル状態: `useState` / `useReducer`
- サーバー状態: API Route 経由で fetch
- グローバル状態: 現時点では Context 不使用（必要になれば導入）

## パフォーマンス考慮事項

- 画像: `next/image` で最適化（サイズ指定必須）
- コード分割: App Router の自動分割に依存
- フォント: `next/font` で最適化読み込み
- Suspense: 非同期コンポーネントに適用

## 既知の課題

| ファイル | 行数 | 問題 | 対応 |
|---------|------|------|------|
| `useChatSession.ts` | 688 | 10 責務が混在 | 4 フック + 1 ユーティリティに分割 |
| `dashboard/page.tsx` | 553 | ロジック + UI 混在 | SessionCard, SessionsGrid 等に分離 |
| `PreviewPanel.tsx` | 290 | StepFlow, AspectRatioTabs が内包 | サブコンポーネント抽出 |
| login/signup | 重複 | レイアウト・背景が同一 | AuthLayout 共通コンポーネント化 |
