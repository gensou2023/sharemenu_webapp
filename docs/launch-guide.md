# MenuCraft AI - 本番ローンチガイド

**作成日**: 2026-02-10
**対象**: デモ環境 → 本番Webアプリとしてのローンチ手順

---

## 目次

1. [ローンチ前チェックリスト](#1-ローンチ前チェックリスト)
2. [リポジトリのプライベート化](#2-リポジトリのプライベート化)
3. [独自ドメインの取得・設定](#3-独自ドメインの取得設定)
4. [Vercel 本番環境の構築](#4-vercel-本番環境の構築)
5. [Supabase 本番環境の構築](#5-supabase-本番環境の構築)
6. [セキュリティ強化](#6-セキュリティ強化)
7. [デモモードの無効化](#7-デモモードの無効化)
8. [決済連携（Stripe）](#8-決済連携stripe)
9. [メール配信設定](#9-メール配信設定)
10. [モニタリング・ログ](#10-モニタリングログ)
11. [法的要件](#11-法的要件)
12. [ローンチ手順（当日）](#12-ローンチ手順当日)
13. [ローンチ後の運用](#13-ローンチ後の運用)

---

## 1. ローンチ前チェックリスト

### 必須（ローンチブロッカー）

- [ ] リポジトリをプライベートに変更
- [ ] 全シークレットキーをローテーション（AUTH_SECRET, GEMINI_API_KEY, Supabase keys）
- [ ] デモモード（`NEXT_PUBLIC_DEMO_MODE`）を無効化
- [ ] デモアカウント（demo@menucraft.jp, admin@menucraft.jp）のパスワード変更
- [ ] 独自ドメインを設定
- [ ] HTTPS（SSL証明書）を確認（Vercel は自動）
- [ ] 利用規約・プライバシーポリシーの内容を最終確認
- [ ] 特定商取引法に基づく表記の確認
- [ ] Cookie 同意バナーの実装

### 推奨（ローンチ後早期に対応）

- [ ] Stripe 決済連携（Pro プラン課金）
- [ ] メール配信設定（登録確認メール等）
- [ ] エラー監視（Sentry 等）
- [ ] アクセス解析（Google Analytics / Vercel Analytics）
- [ ] OGP メタタグ・SNS シェア画像の設定
- [ ] バックアップ戦略の策定
- [ ] レート制限の Redis 移行

---

## 2. リポジトリのプライベート化

### 手順

```bash
# GitHub CLI で設定変更
gh repo edit gensou2023/sharemenu_webapp --visibility private
```

### GitHub Web UI からの場合

1. https://github.com/gensou2023/sharemenu_webapp/settings にアクセス
2. 最下部「Danger Zone」→「Change repository visibility」
3. 「Make private」を選択
4. リポジトリ名を入力して確認

### 注意点

- Vercel の GitHub 連携は**プライベートリポジトリでも動作する**（Hobby プランでも可）
- コラボレーターを追加する場合は Settings → Collaborators から招待
- GitHub Pages を使っている場合は無効になる（本プロジェクトは不使用）

---

## 3. 独自ドメインの取得・設定

### 3.1 ドメイン取得

推奨レジストラ:
- **Google Domains** (Squarespace Domains) - 管理が簡単
- **お名前.com** - 日本語サポートが充実
- **Cloudflare Registrar** - 最安値に近い、DNS も一体管理

推奨ドメイン例:
- `menucraft.jp`（.jp ドメイン: 年額 約3,000円）
- `menucraft-ai.com`（.com ドメイン: 年額 約1,500円）

### 3.2 Vercel にドメインを追加

```bash
# Vercel CLI でドメイン追加
vercel domains add menucraft.jp

# または Vercel ダッシュボードから:
# Project Settings → Domains → Add Domain
```

### 3.3 DNS 設定

Vercel から指示される DNS レコードをレジストラに設定:

| タイプ | 名前 | 値 |
|--------|------|-----|
| A | @ | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |

**設定後、SSL 証明書は Vercel が自動発行（Let's Encrypt）**

### 3.4 リダイレクト設定

`vercel.json` を作成:

```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "has": [{ "type": "host", "value": "www.menucraft.jp" }],
      "destination": "https://menucraft.jp/$1",
      "permanent": true
    },
    {
      "source": "/(.*)",
      "has": [{ "type": "host", "value": "sharemenu-webapp.vercel.app" }],
      "destination": "https://menucraft.jp/$1",
      "permanent": true
    }
  ]
}
```

---

## 4. Vercel 本番環境の構築

### 4.1 プランの検討

| プラン | 月額 | 特徴 |
|--------|------|------|
| Hobby (現行) | 無料 | 個人プロジェクト、商用利用不可 |
| **Pro（推奨）** | $20/月 | 商用利用可、チーム機能、分析、高速ビルド |
| Enterprise | 要問合せ | SLA、セキュリティ、サポート |

**商用サービスとしてローンチする場合、Pro プラン以上が必須**（Hobby は商用利用規約に抵触）

### 4.2 環境変数の本番設定

Vercel Dashboard → Project Settings → Environment Variables:

| 変数 | 環境 | 備考 |
|------|------|------|
| `AUTH_SECRET` | Production | `openssl rand -base64 32` で新規生成 |
| `NEXTAUTH_URL` | Production | `https://menucraft.jp`（独自ドメイン） |
| `GEMINI_API_KEY` | Production | 本番用 API キー |
| `NEXT_PUBLIC_SUPABASE_URL` | Production | 本番 Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production | 本番 anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production | 本番 service_role key |
| `NEXT_PUBLIC_DEMO_MODE` | Production | `false`（または削除） |

### 4.3 Vercel のセキュリティ設定

- **Headers**: `next.config.ts` にセキュリティヘッダーを追加

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; img-src 'self' data: https://*.supabase.co; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;",
          },
        ],
      },
    ];
  },
};
```

---

## 5. Supabase 本番環境の構築

### 5.1 本番プロジェクトの作成

1. https://supabase.com/dashboard で新規プロジェクト作成
2. リージョン: **Tokyo (ap-northeast-1)** 推奨
3. データベースパスワードを安全に保管

### 5.2 プランの検討

| プラン | 月額 | DB容量 | 帯域幅 | 備考 |
|--------|------|--------|--------|------|
| Free (現行) | $0 | 500MB | 5GB/月 | 開発用、2プロジェクトまで |
| **Pro（推奨）** | $25/月 | 8GB | 250GB/月 | バックアップ、ログ保持30日 |
| Team | $599/月 | 8GB+ | 無制限 | SOC2、優先サポート |

**本番ローンチには Pro プラン以上を推奨**（バックアップ・パフォーマンス）

### 5.3 スキーマ移行

```bash
# 本番DBにテーブルを作成
# Supabase Dashboard → SQL Editor で実行
# ファイル: supabase/001_create_tables.sql

# 必要に応じてシードデータ投入
# ファイル: supabase/002_seed_data.sql
# ※ デモユーザーは投入しない
```

### 5.4 RLS（Row Level Security）の強化

現在の RLS は最小限。本番ではポリシーを追加:

```sql
-- ユーザーは自分のデータのみ参照可能
CREATE POLICY "Users can view own sessions"
  ON chat_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own images"
  ON generated_images FOR SELECT
  USING (user_id = auth.uid());
```

### 5.5 バックアップ設定（Pro プラン）

- 自動バックアップ: Proプランで毎日自動実行
- Point-in-Time Recovery (PITR): 有効化推奨
- 手動バックアップ: `pg_dump` による定期エクスポート

---

## 6. セキュリティ強化

### 6.1 最優先で対応すべき項目

| # | 項目 | 影響 | 対応方法 |
|---|------|------|---------|
| 1 | 全シークレットキーのローテーション | 全システム | 新しいキーを生成し、Vercel 環境変数を更新 |
| 2 | プレーンテキストパスワード比較の廃止 | 認証基盤 | auth.ts のフォールバック削除、全パスワードを bcrypt に |
| 3 | 画像アップロードのサイズ制限 | DoS 防止 | Base64 文字列の最大長チェック追加 |
| 4 | エラーメッセージの汎用化 | 情報漏洩防止 | Supabase エラーをそのまま返さない |
| 5 | サインアップのレート制限 | アカウント乱立防止 | IP ベースのレート制限追加 |
| 6 | CSRF トークン検証 | クロスサイト攻撃防止 | Origin/Referer ヘッダー検証 |
| 7 | XSS 対策強化 | ユーザーデータ保護 | DOMPurify の適用範囲拡大 |

### 6.2 キーローテーション手順

```bash
# 1. AUTH_SECRET を新規生成
openssl rand -base64 32

# 2. Gemini API Key を Google AI Studio で再生成
# https://aistudio.google.com/apikey

# 3. Supabase Keys を再生成
# Supabase Dashboard → Settings → API → Regenerate keys

# 4. Vercel の環境変数を更新
vercel env rm AUTH_SECRET production
vercel env add AUTH_SECRET production

# 5. 再デプロイ
vercel --prod
```

---

## 7. デモモードの無効化

### 7.1 環境変数の変更

```bash
# Vercel 環境変数から削除 or false に設定
NEXT_PUBLIC_DEMO_MODE=false
```

### 7.2 コード変更

`src/auth.ts`:
- デモユーザーのハードコード（行 12-29）を削除または環境変数参照に変更
- プレーンテキストパスワード比較（行 59-66）を削除

`src/app/login/page.tsx`:
- デモアカウント表示セクションを削除

### 7.3 管理者アカウントの準備

```bash
# 本番用の管理者アカウントを Supabase に直接作成
# SQL Editor で実行:
INSERT INTO users (email, name, role, password_hash)
VALUES (
  'admin@実際のドメイン.jp',
  '管理者名',
  'admin',
  '$2b$10$xxxxxx'  -- bcryptjs で生成したハッシュ
);
```

---

## 8. 決済連携（Stripe）

### 8.1 Stripe アカウント設定

1. https://stripe.com/jp で法人アカウント作成
2. 本人確認・事業情報の登録
3. 本番キー（publishable_key, secret_key）を取得

### 8.2 実装概要

```
1. Stripe Checkout セッション作成 API（/api/stripe/checkout）
2. Webhook エンドポイント（/api/stripe/webhook）
3. ユーザーテーブルに plan, stripe_customer_id カラム追加
4. Pro プランの機能制限ロジック更新
```

### 8.3 必要な環境変数

| 変数 | 説明 |
|------|------|
| `STRIPE_SECRET_KEY` | Stripe シークレットキー |
| `STRIPE_PUBLISHABLE_KEY` | Stripe 公開キー |
| `STRIPE_WEBHOOK_SECRET` | Webhook 署名検証キー |
| `STRIPE_PRO_PRICE_ID` | Pro プランの Price ID |

### 8.4 料金体系

- **Pro プラン**: ¥700/月（サブスクリプション）
- Stripe 手数料: 3.6% + ¥40/件
- 実質収入: 約 ¥635/件

---

## 9. メール配信設定

### 9.1 推奨サービス

| サービス | 月額 | 特徴 |
|---------|------|------|
| **Resend** | 無料〜$20/月 | Next.js 親和性高、React Email 対応 |
| SendGrid | 無料〜$19.95/月 | 実績豊富、日本語ドキュメント |
| Amazon SES | 従量課金 | 最安、設定が複雑 |

### 9.2 必要なメール

| メール | トリガー | 優先度 |
|--------|---------|--------|
| 登録確認メール | サインアップ時 | 必須 |
| パスワードリセット | リセット要求時 | 必須 |
| Pro プラン購入完了 | Stripe 決済成功時 | 推奨 |
| セッション完了通知 | 画像生成完了時 | 任意 |

---

## 10. モニタリング・ログ

### 10.1 エラー監視

```bash
# Sentry 導入
npm install @sentry/nextjs

# sentry.client.config.ts, sentry.server.config.ts を設定
npx @sentry/wizard@latest -i nextjs
```

### 10.2 アクセス解析

**Vercel Analytics**（推奨、Pro プラン付属）:
```bash
npm install @vercel/analytics

# layout.tsx に追加
import { Analytics } from '@vercel/analytics/react';
// <Analytics /> を配置
```

**Google Analytics 4**:
```bash
npm install @next/third-parties

# layout.tsx に追加
import { GoogleAnalytics } from '@next/third-parties/google';
// <GoogleAnalytics gaId="G-XXXXXXXXXX" />
```

### 10.3 稼働監視

- **UptimeRobot**（無料）: 5分間隔のヘルスチェック
- **Better Stack**（無料プランあり）: ステータスページ付き

---

## 11. 法的要件

### 11.1 確認・更新が必要な文書

| 文書 | パス | 確認事項 |
|------|------|---------|
| 利用規約 | `/terms` | AI 生成物の著作権、免責事項、禁止事項 |
| プライバシーポリシー | `/privacy` | 個人情報の取扱い、Cookie 利用、第三者提供 |
| 特定商取引法に基づく表記 | `/tokushoho` | 販売者情報、返金ポリシー |

### 11.2 GDPR / 個人情報保護法対応

- Cookie 同意バナーの実装
- データ削除リクエストへの対応フロー
- プライバシーポリシーに Gemini API へのデータ送信を明記

### 11.3 AI 生成物に関する注意事項

利用規約に以下を明記:
- AI 生成画像の著作権の帰属
- 生成画像の商用利用範囲
- AI が生成するテキスト（キャッチコピー等）の正確性の免責

---

## 12. ローンチ手順（当日）

### Phase 1: インフラ準備（ローンチ 1週間前）

```
□ 独自ドメイン取得・DNS 設定
□ Vercel Pro プラン契約
□ Supabase Pro プラン契約（必要に応じて）
□ 本番用 Supabase プロジェクト作成・スキーマ移行
□ 全シークレットキーのローテーション
□ Vercel 環境変数を本番値に設定
```

### Phase 2: コード準備（ローンチ 3日前）

```
□ デモモード無効化
□ セキュリティ修正（優先項目）
□ OGP メタタグ・SNS シェア画像設定
□ next.config.ts にセキュリティヘッダー追加
□ 本番ビルドの動作確認
```

### Phase 3: リポジトリ準備（ローンチ 1日前）

```
□ GitHub リポジトリをプライベート化
□ .env.local が .gitignore に含まれていることを再確認
□ README.md からデモアカウント情報を削除
□ 最終コミット・プッシュ
```

### Phase 4: ローンチ当日

```
□ Vercel で本番デプロイを実行
□ 独自ドメインでアクセス確認
□ SSL 証明書の確認
□ 新規ユーザー登録テスト
□ チャット → 画像生成のE2Eテスト
□ モバイル表示の確認
□ エラー監視ツールの動作確認
□ SNS でローンチ告知
```

---

## 13. ローンチ後の運用

### 13.1 日次チェック

- エラー監視ダッシュボードの確認
- API 使用量の確認（Gemini API のクォータ）
- Supabase のストレージ使用量確認

### 13.2 週次チェック

- ユーザー登録数・アクティブユーザー数の確認
- 画像生成数の推移確認
- フィードバック・問い合わせ対応

### 13.3 月次チェック

- Stripe 売上レポート確認
- Gemini API コスト確認
- Supabase/Vercel の請求確認
- セキュリティアップデートの適用（npm audit）

### 13.4 コスト見積もり（月額）

| サービス | プラン | 月額 |
|---------|--------|------|
| Vercel | Pro | $20 (約3,000円) |
| Supabase | Pro | $25 (約3,750円) |
| ドメイン | .jp | 約250円/月（年3,000円） |
| Gemini API | 従量課金 | 使用量次第（目安: 1,000〜5,000円） |
| Stripe | 手数料 | 売上の 3.6% + ¥40/件 |
| Sentry | Developer | 無料 |
| **合計** | | **約7,000〜12,000円/月** + API 従量課金 |

**損益分岐点**: Pro プラン（¥700/月）× 約 18 ユーザー ≒ 月額コストをカバー

---

## 付録: 技術的な改善事項（コードレビュー結果）

詳細は [WORK_LOG.md](../WORK_LOG.md) を参照。以下は優先度順のサマリー:

### Critical（最優先）

1. XSS リスク: `dangerouslySetInnerHTML` の安全性強化
2. シークレットキーのローテーション
3. プレーンテキストパスワード比較の廃止

### High（ローンチ前に対応推奨）

4. モーダルのアクセシビリティ（フォーカストラップ、ESC キー）
5. 画像アップロードのサイズ制限
6. API エラーメッセージの汎用化（情報漏洩防止）
7. サインアップのレート制限
8. ミドルウェアでの API ルート保護
9. OGP メタタグの設定

### Medium（ローンチ後早期に対応）

10. CSRF 対策
11. インメモリレートリミッター → Redis 移行
12. React.memo による再レンダリング最適化
13. Base64 画像データの URL 化
14. SEO ページ別メタデータ
