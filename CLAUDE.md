# MenuCraft AI — プロジェクトガイド

## プロジェクト概要

MenuCraft AI は、飲食店オーナー向けの AI メニュー画像自動生成 SaaS。
チャット形式で店舗情報やメニューを伝えると、SNS 最適サイズの画像を自動生成する。

- **本番 URL:** https://sharemenu-webapp.vercel.app
- **リポジトリ:** https://github.com/gensou2023/sharemenu_webapp

---

## Claude Code ワークフロー

### セッション開始時

新しいセッションを始める際は、まず以下を確認すること:

1. この CLAUDE.md を読む
2. `docs/` 配下の最新プランニングドキュメントを確認する
3. 前回のセッションで中断したタスクがあれば、「次回セッションのタスク」セクションを参照する

### 開発ワークフロー

- コードは必ず **TypeScript** で書く
- Supabase Storage を使う機能を実装する際は、**バケットの公開設定（public/private）を事前に確認**してから画像URL生成のロジックを書くこと
- DB マイグレーションを実行する際、リモート直接接続ができない場合は **SQL を出力してユーザーに Supabase ダッシュボードで手動実行してもらう**（psql や Management API で試行錯誤しない）
- 機能実装前に前提条件を確認する: 1) 必要なサービス/APIにアクセス可能か 2) 関連ファイルの現状 3) 検証すべき仮定はあるか

### MCP & 外部サービス

- MCP ツール（特に Notion）を使う際は、まず簡単なテストコールで接続確認する
- MCP ツールが 1〜2 回失敗したら、**即座に直接 API コール（curl）にフォールバック**する。MCP 設定のデバッグに時間を使わない
- Notion 連携でパーミッションエラーが出たら、ユーザーに Notion 側でインテグレーションのページアクセス設定を確認するよう伝える

### ファイル & システム操作

- `sudo` コマンドは実行できない。昇格権限が必要な場合は、ユーザーに手動実行してもらう
- ファイル移動・マイグレーション前に、ターゲットが既に存在するか確認する

---

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

## Git ワークフロー

```
main        ← 本番安定ブランチ
 └─ develop ← 統合ブランチ（通常はここで作業）
     └─ feature/* or design/* ← 機能・デザインブランチ
```

- すべての変更は **feature ブランチ** で行う
- feature ブランチは develop にマージ（**PR + squash merge**）
- 安定確認後 develop → main を fast-forward マージ
- コミットメッセージは **英語** で記述
- プレフィックス: `feat:` / `fix:` / `design:` / `docs:` / `refactor:` / `test:`
- PR 作成前に `npm run build` を必ず実行して成功を確認する

## ディレクトリ構成

```
src/
├── app/
│   ├── api/              # 27 API エンドポイント
│   ├── admin/            # 管理画面（7ページ）
│   ├── chat/             # チャット画面
│   ├── dashboard/        # ダッシュボード
│   ├── gallery/          # ギャラリー
│   ├── settings/         # アカウント設定
│   ├── login/ signup/    # 認証ページ
│   ├── globals.css       # デザイントークン定義
│   ├── layout.tsx        # ルートレイアウト
│   └── page.tsx          # LP（ランディングページ）
├── __tests__/            # Vitest テスト
│   └── lib/              # ユーティリティテスト
├── components/
│   ├── landing/          # LP セクション（9コンポーネント）
│   ├── chat/             # ChatInput, ChatMessage, PreviewPanel, PromptMode, SavePromptModal
│   ├── dashboard/        # StatsSection, SessionGrid, AchievementSection, etc.
│   ├── gallery/          # GalleryCard, ShareModal
│   └── admin/            # KpiCard, TrendChart, etc.
├── hooks/
│   ├── chat/             # チャットフロー分割済みフック群（6ファイル）
│   ├── useChatSession.ts # チャットオーケストレーター（177行）
│   └── useOnlineStatus.ts
├── lib/
│   ├── supabase.ts       # Supabase クライアント
│   ├── types.ts          # 型定義
│   ├── admin-auth.ts     # admin認証ミドルウェア（withAdmin）
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
| `users` | ユーザー（email, role, password_hash, onboarding, deleted_at） |
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
| `achievements` | バッジ定義 |
| `user_achievements` | ユーザーバッジ獲得記録 |
| `user_prompts` | ユーザー保存プロンプト（admin限定） |

## API エンドポイント（27本）

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
| `/api/account` | GET/PATCH/DELETE | アカウント情報・退会 |
| `/api/signup` | POST | ユーザー登録 |
| `/api/gallery` | GET/POST | ギャラリー一覧・共有 |
| `/api/gallery/[id]/like` | POST | いいね |
| `/api/gallery/[id]/save` | POST | 保存 |
| `/api/gallery/[id]/report` | POST | 通報 |
| `/api/gallery/saves` | GET | 保存済み一覧 |
| `/api/achievements` | GET/PATCH | バッジ一覧・既読 |
| `/api/achievements/check` | POST | バッジ判定 |
| `/api/prompts/mine` | GET/POST | マイプロンプト一覧・保存（admin限定） |
| `/api/prompts/mine/[id]` | PATCH/DELETE | プロンプト編集・削除（admin限定） |
| `/api/admin/*` | GET/POST | 管理系 API（stats, sessions, users, prompts, references, api-logs） |

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

## UI レイアウト設計方針

### 画面別カラム構成

| 画面 | カラム数 | 構成 | 根拠 |
|------|---------|------|------|
| ホーム（LP） | 1カラム | メインコンテンツのみ | LP的役割。情報を上から順に読ませる |
| ダッシュボード | 2カラム | 左サイドバー + メインエリア | 管理機能への常時アクセス + KPI閲覧の両立 |
| チャット（生成画面） | 3カラム | 左履歴パネル(トグル) + チャット + プレビュー | 「対話」と「成果物プレビュー」の同時表示が必須 |
| 管理画面 | 2カラム | 左サイドナビ + メインエリア | 管理系操作の標準パターン |

### デザインコンセプト: 「伴走するダッシュボード」

ドライな効率性だけでなく、CAMPFIRE Community のような **ウェット（温かみ・伴走感）** な要素を取り入れる。

**ウェット要素の一覧:**
- 時間帯に応じたウェルカムメッセージ（「おはようございます」「おつかれさまです」等）
- キャラクターイラスト + 状況に応じた動的セリフ
- 作成フローのステッパーUIに完了アニメーション
- 画像生成完了時のパネルスライドイン演出
- ダウンロード後の次アクション提案（「SNSに投稿してみましょう！」）
- 動的Tips（利用フェーズに応じた出し分け）

**チャット画面の3カラム仕様:**
- 左パネル: デフォルト折りたたみ。トグルで展開（240px）。セッション履歴 + テンプレート
- 中央: チャットエリア（最小480px）
- 右パネル: デフォルト折りたたみ。**初回画像生成完了時に自動展開**（360px）。プレビュー + 作成フロー + アクションボタン

**レスポンシブ:**
- Desktop（1280px〜）: 全カラム表示
- Tablet（768〜1279px）: 左パネル非表示、2カラム
- Mobile（〜767px）: 1カラム。プレビューはボトムシートまたはインライン表示

詳細仕様は `docs/dashboard-requirements-v1.md` を参照。

---

## 既知の技術的負債

| 項目 | 優先度 | 概要 |
|------|--------|------|
| useChatSession.ts | ~~HIGH~~ DONE | ~~688行・10責務~~ → hooks/chat/ に6ファイル分割済み（177行に縮小） |
| dashboard/page.tsx | HIGH | 169行 → コンポーネント分離必要 |
| admin 認証チェック | ~~HIGH~~ DONE | ~~5箇所重複~~ → `withAdmin()` ミドルウェアに統一済み（全7ルート対応） |
| login/signup レイアウト | MEDIUM | 重複 → AuthLayout 共通化 |
| テストコード | HIGH | Vitest 基盤構築済み → カバレッジ拡大が必要（現在 admin-auth, rate-limiter のみ） |

## 次回セッションのタスク

### Tier 1（基盤 + 高インパクト）— 最優先
1. **#36 ダッシュボード 2カラム化** — サイドバー + メインエリアへのレイアウト変更
2. **#45 設定ページリデザイン** — Canva風サイドナビ + セクション分割
3. **テストカバレッジ拡大** — API ルートのテスト追加（Vitest基盤は構築済み）

### Tier 2（UX改善）
4. **#37 ウェルカムエリア実装** — 時間帯別挨拶 + キャラクターメッセージ
5. **#49 パスワード変更** — 現在「準備中」の実装
6. **#39 +新規作成カード** — ダッシュボードのグリッドに追加
7. **#38 広告枠配置変更** — チャット入力直上から移動

### Tier 3（差別化・エンゲージメント）
8. **#46 プロフィール拡充** — 業種カテゴリ・プロフィールアイコン
9. **#48 通知センター** — アプリ内通知パネル + ギャラリーアクティビティ通知
10. **#47 ダークモード** — テーマ切替（Light/Dark/System）
11. **#41 インサイトカード** — DL数・公開数・前週比

### Tier 4-5（余裕があれば / Backlog）
12. **#40 動的Tips** / **#50 ギャラリープライバシー** / **#52 利用状況レポート**
13. **#42-44 リリースノート** — ユーザー数に応じてスケジュール
14. **SEO/OGP 対応** — meta タグ、OG 画像、構造化データ

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
