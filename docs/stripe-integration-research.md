# Stripe 決済連携 リサーチドキュメント

作成日: 2026-02-16
対象: MenuCraft AI (Next.js 15 App Router + Supabase + Vercel)

---

## 目次

1. [Stripe アカウントセットアップ](#1-stripe-アカウントセットアップ)
2. [API キー & 環境変数](#2-api-キー--環境変数)
3. [Products & Prices の設定](#3-products--prices-の設定)
4. [Checkout Session フロー](#4-checkout-session-フロー)
5. [Customer Portal（カスタマーポータル）](#5-customer-portalカスタマーポータル)
6. [Webhooks（イベント処理）](#6-webhooksイベント処理)
7. [Stripe CLI（ローカルテスト）](#7-stripe-cliローカルテスト)
8. [npm パッケージ](#8-npm-パッケージ)
9. [データベース変更](#9-データベース変更)
10. [テストモード vs ライブモード](#10-テストモード-vs-ライブモード)
11. [Vercel 固有の設定](#11-vercel-固有の設定)
12. [日本法令コンプライアンス](#12-日本法令コンプライアンス)
13. [実装チェックリスト](#13-実装チェックリスト)

---

## 1. Stripe アカウントセットアップ

### 1.1 アカウント作成

1. [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register) にアクセス
2. メールアドレス、パスワードで登録
3. アカウント名: `MenuCraft AI` に設定

### 1.2 ダッシュボード設定（日本向け）

| 設定項目 | 場所 | 設定値 |
|---------|------|--------|
| ビジネス所在地 | Settings > Business > Country | **日本** |
| デフォルト通貨 | Settings > Business > Default currency | **JPY（日本円）** |
| ビジネス名 | Settings > Business > Business name | `MenuCraft AI` |
| ステートメント表記 | Settings > Business > Statement descriptor | `MENUCRAFT AI`（カード明細に表示される名前、半角英大文字22文字以内） |
| サポートメール | Settings > Business | `support@menucraft-ai.jp` |
| サポート URL | Settings > Business | `https://sharemenu-webapp.vercel.app/tokushoho` |

### 1.3 JPY（日本円）の注意点

**JPY はゼロデシマル通貨**（小数点なし）。

```
# 他の通貨（USD）: $10.00 → amount: 1000（セント単位）
# JPY: ¥700 → amount: 700（円単位、そのまま）
```

つまり `amount: 700` で ¥700 になる。USD のように100を掛ける必要はない。

**最小請求額**: ¥50
**最大請求額**: ¥9,999,999

### 1.4 本番利用前の審査

Stripe を本番で使用するには、ビジネス情報の審査が必要:

- 法人/個人事業主の情報
- 銀行口座（売上受取用）
- 本人確認書類
- ビジネスのウェブサイト URL
- 特定商取引法に基づく表記ページ（後述）

テストモードは審査なしで即利用可能。

---

## 2. API キー & 環境変数

### 2.1 必要な API キー

Stripe Dashboard > Developers > API keys から取得。

| キー | 用途 | プレフィックス |
|------|------|-------------|
| Publishable Key | クライアントサイド（Stripe.js 初期化） | `pk_test_` / `pk_live_` |
| Secret Key | サーバーサイド（API コール全般） | `sk_test_` / `sk_live_` |
| Webhook Signing Secret | Webhook 署名検証 | `whsec_` |

### 2.2 環境変数の設定

`.env.local` に追加:

```bash
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_<your_publishable_key>"
STRIPE_SECRET_KEY="sk_test_<your_secret_key>"
STRIPE_WEBHOOK_SECRET="whsec_<your_webhook_secret>"

# Stripe Price IDs（Dashboard で商品作成後に取得）
STRIPE_PRICE_ID_PRO_MONTHLY="price_XXXXXXXXXXXXXXXXXXXXXXXX"
# STRIPE_PRICE_ID_BUSINESS_MONTHLY="price_XXXXXXXXXXXXXXXXXXXXXXXX"  # 将来用
```

### 2.3 セキュリティ注意事項

| ルール | 詳細 |
|--------|------|
| `NEXT_PUBLIC_` プレフィックス | Publishable Key のみ。Secret Key には絶対に付けない |
| `.gitignore` | `.env*.local` が含まれていることを確認（Next.js デフォルトで含まれている） |
| Secret Key の保管 | サーバーサイド（Route Handler / Server Action）でのみ使用 |
| Webhook Secret | ローカル開発用（Stripe CLI で生成）と本番用は異なる |

---

## 3. Products & Prices の設定

### 3.1 Stripe Dashboard での設定方法

**Dashboard > Products** から作成。

#### Product 1: Pro プラン

| 項目 | 設定値 |
|------|--------|
| Product name | `MenuCraft AI Pro プラン` |
| Description | `月50枚の画像生成。全機能利用可能。画像無期限保存。` |

**Price の設定:**

| 項目 | 設定値 |
|------|--------|
| Pricing model | Standard pricing |
| Price | `700`（JPY） |
| Billing period | Monthly（毎月） |
| Currency | JPY |

作成後、以下の ID が生成される:
- Product ID: `prod_XXXXXXXX`（商品識別子）
- Price ID: `price_XXXXXXXX`（価格識別子、Checkout Session で使用）

#### Product 2: Business プラン（将来用）

| 項目 | 設定値 |
|------|--------|
| Product name | `MenuCraft AI Business プラン` |
| Price | `1980`（JPY） |
| Billing period | Monthly |

### 3.2 API での設定方法（代替）

Dashboard の代わりに Stripe API で作成することも可能。一度だけ実行するセットアップスクリプト:

```typescript
// scripts/setup-stripe-products.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function setupProducts() {
  // Pro プラン Product 作成
  const proProduct = await stripe.products.create({
    name: 'MenuCraft AI Pro プラン',
    description: '月50枚の画像生成。全機能利用可能。画像無期限保存。',
    metadata: {
      plan: 'pro',
    },
  });
  console.log('Pro Product ID:', proProduct.id);

  // Pro プラン Price 作成
  const proPrice = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 700,          // ¥700（JPY はゼロデシマル）
    currency: 'jpy',
    recurring: {
      interval: 'month',       // 月額
    },
    metadata: {
      plan: 'pro',
    },
  });
  console.log('Pro Price ID:', proPrice.id);
  // → この price_XXXX を STRIPE_PRICE_ID_PRO_MONTHLY に設定
}

setupProducts();
```

### 3.3 年額プラン（将来用）

将来的に年額プラン（¥7,000/年 = 2ヶ月分お得）を追加する場合:

```typescript
const proYearlyPrice = await stripe.prices.create({
  product: proProduct.id,       // 同じ Product に紐づける
  unit_amount: 7000,            // ¥7,000
  currency: 'jpy',
  recurring: {
    interval: 'year',           // 年額
  },
  metadata: {
    plan: 'pro',
    billing_period: 'yearly',
  },
});
```

---

## 4. Checkout Session フロー

### 4.1 全体フロー

```
ユーザーがプランページで「Pro にアップグレード」クリック
  ↓
Server Action / Route Handler で Checkout Session 作成
  ↓
Stripe Hosted Checkout ページにリダイレクト
  ↓
ユーザーがカード情報入力・決済完了
  ↓
success_url にリダイレクト（ユーザーに完了表示）
  ↓
同時に Webhook で checkout.session.completed イベント受信
  ↓
DB を更新（plan = 'pro', stripe_customer_id, stripe_subscription_id 保存）
```

### 4.2 推奨アーキテクチャ（Next.js 15 App Router）

**2025-2026 年の推奨: Route Handler を使用**

Server Actions でも実装可能だが、Stripe Checkout のリダイレクトフローは Route Handler の方が相性が良い。理由:

- Checkout Session 作成後に `session.url` へリダイレクトする必要がある
- Server Actions は `redirect()` が try/catch 内で使えない制約がある
- Route Handler なら `NextResponse.json()` でセッション情報を返し、クライアントでリダイレクトできる

### 4.3 実装コード

#### サーバーサイド: Checkout Session 作成

```typescript
// src/app/api/stripe/checkout/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    // 1. 認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { priceId } = await request.json();

    // 2. ユーザーの Stripe Customer ID を取得（既存の場合）
    const supabase = createAdminClient();
    const { data: user } = await supabase
      .from('users')
      .select('stripe_customer_id, email')
      .eq('id', session.user.id)
      .single();

    // 3. Checkout Session 作成パラメータ
    const params: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${request.headers.get('origin')}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/settings?checkout=cancelled`,
      metadata: {
        userId: session.user.id,           // Webhook で DB 更新に使用
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,         // サブスクリプションにもメタデータを付与
        },
      },
      locale: 'ja',                        // 日本語表示
      allow_promotion_codes: true,         // プロモーションコード入力欄を表示（任意）
    };

    // 既存 Stripe Customer がいればそれを使う、なければ email を渡して新規作成
    if (user?.stripe_customer_id) {
      params.customer = user.stripe_customer_id;
    } else {
      params.customer_email = user?.email || session.user.email!;
    }

    // 4. Checkout Session 作成
    const checkoutSession = await stripe.checkout.sessions.create(params);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe Checkout Session creation error:', error);
    return NextResponse.json(
      { error: 'チェックアウトセッションの作成に失敗しました' },
      { status: 500 }
    );
  }
}
```

#### クライアントサイド: アップグレードボタン

```tsx
// src/components/settings/UpgradeButton.tsx
'use client';

import { useState } from 'react';

export function UpgradeButton({ priceId }: { priceId: string }) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const { url, error } = await res.json();
      if (error) throw new Error(error);

      // Stripe Checkout ページにリダイレクト
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="bg-accent-warm text-white px-6 py-3 rounded-full font-medium
                 hover:bg-accent-warm-hover transition-colors disabled:opacity-50"
    >
      {loading ? '処理中...' : 'Pro にアップグレード'}
    </button>
  );
}
```

### 4.4 Server Actions による代替実装

```typescript
// src/app/actions/stripe.ts
'use server';

import Stripe from 'stripe';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession(priceId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('認証が必要です');
  }

  const supabase = createAdminClient();
  const { data: user } = await supabase
    .from('users')
    .select('stripe_customer_id, email')
    .eq('id', session.user.id)
    .single();

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?checkout=cancelled`,
    customer: user?.stripe_customer_id || undefined,
    customer_email: user?.stripe_customer_id ? undefined : user?.email,
    metadata: { userId: session.user.id },
    subscription_data: { metadata: { userId: session.user.id } },
    locale: 'ja',
  });

  if (checkoutSession.url) {
    redirect(checkoutSession.url);
  }
}
```

**注意**: Server Actions 内の `redirect()` は内部的に例外をスローするため、`try/catch` で囲むと正常にリダイレクトされない。`redirect()` は関数の最後で呼ぶこと。

---

## 5. Customer Portal（カスタマーポータル）

### 5.1 概要

Stripe Customer Portal は、ユーザーが自分のサブスクリプションを管理できる Stripe ホスティングの画面。以下が可能:

- 支払い方法の変更
- サブスクリプションのキャンセル
- プランの変更（アップグレード/ダウングレード）
- 請求履歴・インボイスの確認
- 税 ID の管理

### 5.2 Dashboard での設定

**Settings > Billing > Customer portal** で設定:

| 設定項目 | 推奨設定 |
|---------|---------|
| Payment methods | 有効化（カード更新を許可） |
| Cancel subscriptions | 有効化 |
| Cancellation reasons | 有効化（解約理由を収集） |
| Switch plans | 有効化（将来 Business プラン追加時） |
| Update quantities | 無効（枚数制限は固定のため） |
| Invoice history | 有効化 |
| Tax IDs | 有効化（インボイス制度対応） |
| Headline | `MenuCraft AI サブスクリプション管理` |
| Return URL | `https://sharemenu-webapp.vercel.app/settings` |

### 5.3 サーバーサイド: Portal Session 作成

```typescript
// src/app/api/stripe/portal/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // ユーザーの Stripe Customer ID を取得
    const supabase = createAdminClient();
    const { data: user } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single();

    if (!user?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Stripe アカウントが見つかりません' },
        { status: 400 }
      );
    }

    // Customer Portal Session 作成
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${request.headers.get('origin')}/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Portal session creation error:', error);
    return NextResponse.json(
      { error: 'ポータルセッションの作成に失敗しました' },
      { status: 500 }
    );
  }
}
```

### 5.4 クライアントサイド: 管理ボタン

```tsx
// src/components/settings/ManageSubscriptionButton.tsx
'use client';

import { useState } from 'react';

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  const handleManage = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (error) {
      console.error('Portal error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleManage}
      disabled={loading}
      className="border border-border-light text-text-primary px-4 py-2 rounded-full
                 text-sm hover:border-accent-warm hover:text-accent-warm transition-colors"
    >
      {loading ? '読み込み中...' : 'サブスクリプションを管理'}
    </button>
  );
}
```

---

## 6. Webhooks（イベント処理）

### 6.1 処理すべきイベント一覧

| イベント | タイミング | 必要なDB処理 |
|---------|-----------|-------------|
| `checkout.session.completed` | Checkout 完了時 | `stripe_customer_id`, `stripe_subscription_id`, `plan='pro'` を保存 |
| `customer.subscription.updated` | プラン変更、更新成功時 | `plan`, `stripe_price_id`, `stripe_current_period_end` を更新 |
| `customer.subscription.deleted` | 解約完了時 | `plan='free'`, Stripe カラムをクリア |
| `invoice.payment_succeeded` | 月次請求成功時 | `stripe_current_period_end` を更新 |
| `invoice.payment_failed` | 決済失敗時 | ユーザーに通知、一定回数失敗で `plan='free'` |
| `customer.subscription.trial_will_end` | トライアル終了3日前 | ユーザーに通知（将来用） |

### 6.2 Webhook Route Handler 実装

```typescript
// src/app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();     // 重要: request.json() ではなく request.text()
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      // ========================================
      // Checkout 完了
      // ========================================
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (!userId || session.mode !== 'subscription') break;

        // サブスクリプション詳細を取得
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        await supabase
          .from('users')
          .update({
            plan: 'pro',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0]?.price.id,
            stripe_current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          })
          .eq('id', userId);

        console.log(`[Stripe] User ${userId} upgraded to Pro`);
        break;
      }

      // ========================================
      // サブスクリプション更新
      // ========================================
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) break;

        // ステータスに応じて plan を決定
        const plan = subscription.status === 'active' ? 'pro' : 'free';

        await supabase
          .from('users')
          .update({
            plan,
            stripe_price_id: subscription.items.data[0]?.price.id,
            stripe_current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          })
          .eq('id', userId);

        console.log(`[Stripe] Subscription updated for user ${userId}: ${plan}`);
        break;
      }

      // ========================================
      // サブスクリプション削除（解約完了）
      // ========================================
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) break;

        await supabase
          .from('users')
          .update({
            plan: 'free',
            stripe_subscription_id: null,
            stripe_price_id: null,
            stripe_current_period_end: null,
          })
          .eq('id', userId);

        console.log(`[Stripe] Subscription cancelled for user ${userId}`);
        break;
      }

      // ========================================
      // 月次請求成功
      // ========================================
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        );
        const userId = subscription.metadata?.userId;

        if (!userId) break;

        await supabase
          .from('users')
          .update({
            stripe_current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          })
          .eq('id', userId);

        console.log(`[Stripe] Payment succeeded for user ${userId}`);
        break;
      }

      // ========================================
      // 決済失敗
      // ========================================
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        );
        const userId = subscription.metadata?.userId;

        if (!userId) break;

        // TODO: ユーザーに通知を送る（notifications テーブルに挿入）
        console.error(`[Stripe] Payment failed for user ${userId}`);
        break;
      }

      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`[Stripe] Error processing event ${event.type}:`, error);
    // Webhook は 200 を返さないと Stripe がリトライを続けるため、
    // 処理エラーでも 200 を返してログに記録する方針もある。
    // ただし一時的なエラーの場合は 500 を返してリトライさせた方が良い。
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
```

### 6.3 重要な実装ポイント

**`request.text()` を必ず使用する**

```typescript
// 正しい: 生のテキストボディを取得
const body = await request.text();

// 間違い: JSON パースするとハッシュ検証に失敗する
const body = await request.json(); // ← 署名検証エラーになる
```

Stripe は送信した生のリクエストボディ文字列から署名を計算する。`request.json()` は JavaScript オブジェクトに変換してしまうため、元の文字列と一致せず署名検証に失敗する。

**Webhook のべき等性（Idempotency）**

同じイベントが複数回配信される可能性がある。`event.id` をログに記録し、重複処理を防ぐことを推奨:

```typescript
// 簡易的な重複チェック（本格的にはDBで管理）
const { data: existing } = await supabase
  .from('stripe_events')
  .select('id')
  .eq('stripe_event_id', event.id)
  .single();

if (existing) {
  return NextResponse.json({ received: true, duplicate: true });
}
```

---

## 7. Stripe CLI（ローカルテスト）

### 7.1 インストール

```bash
# macOS (Homebrew)
brew install stripe/stripe-cli/stripe

# 確認
stripe --version
```

### 7.2 ログイン

```bash
stripe login
# ブラウザが開き、Stripe アカウントと連携
```

### 7.3 Webhook をローカルに転送

```bash
# 全イベントを転送
stripe listen --forward-to localhost:3000/api/stripe/webhook

# 特定イベントのみ転送（推奨）
stripe listen \
  --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted,invoice.payment_succeeded,invoice.payment_failed \
  --forward-to localhost:3000/api/stripe/webhook
```

実行すると以下が表示される:

```
> Ready! Your webhook signing secret is whsec_XXXXXXXXXXXXXXXX (^C to quit)
```

**この `whsec_` をローカルの `.env.local` の `STRIPE_WEBHOOK_SECRET` に設定する。**

ローカル開発用の `whsec_` と、本番 Dashboard で作成する `whsec_` は異なるので注意。

### 7.4 イベントのトリガー（テスト）

別のターミナルから:

```bash
# Checkout Session 完了をシミュレート
stripe trigger checkout.session.completed

# 決済失敗をシミュレート
stripe trigger invoice.payment_failed

# サブスクリプション更新をシミュレート
stripe trigger customer.subscription.updated
```

### 7.5 ログの確認

```bash
# リアルタイムでイベントログを表示
stripe logs tail

# 特定のイベントタイプのみ
stripe logs tail --filter-event-types checkout.session.completed
```

---

## 8. npm パッケージ

### 8.1 必要なパッケージ

```bash
npm install stripe @stripe/stripe-js
```

| パッケージ | バージョン (2026年2月時点) | 用途 |
|-----------|------------------------|------|
| `stripe` | v20.3.1 | **サーバーサイド**: API コール、Webhook 処理 |
| `@stripe/stripe-js` | 最新 | **クライアントサイド**: Stripe.js ローダー、型定義 |

### 8.2 不要なパッケージ

| パッケージ | 理由 |
|-----------|------|
| `@stripe/react-stripe-js` | Stripe Checkout（リダイレクト方式）を使う場合は不要。Stripe Elements を埋め込む場合のみ必要 |
| `micro` / `raw-body` | Next.js App Router の `request.text()` で代替可能 |

### 8.3 サーバーサイド Stripe クライアントの初期化

```typescript
// src/lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',   // 最新の API バージョンを明示
  typescript: true,
});
```

### 8.4 クライアントサイド Stripe.js の初期化

```typescript
// src/lib/stripe-client.ts
import { loadStripe } from '@stripe/stripe-js';

// loadStripe はシングルトンで管理（複数回呼ばない）
let stripePromise: ReturnType<typeof loadStripe> | null = null;

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
  }
  return stripePromise;
}
```

**注意**: MenuCraft AI は Stripe Checkout（リダイレクト方式）を使用するため、クライアントサイドの `@stripe/stripe-js` は現時点では不要な可能性がある。Checkout Session の `url` に直接 `window.location.href` でリダイレクトするため。将来的に Stripe Elements を使う場合に備えてインストールしておくのは可。

---

## 9. データベース変更

### 9.1 マイグレーション SQL

```sql
-- 016_add_stripe_columns.sql
-- Stripe 決済連携用カラムを users テーブルに追加

-- Stripe Customer ID（ユーザーと Stripe Customer の1:1対応）
ALTER TABLE public.users
  ADD COLUMN stripe_customer_id TEXT UNIQUE;

-- Stripe Subscription ID（アクティブなサブスクリプション）
ALTER TABLE public.users
  ADD COLUMN stripe_subscription_id TEXT UNIQUE;

-- Stripe Price ID（現在のプラン価格）
ALTER TABLE public.users
  ADD COLUMN stripe_price_id TEXT;

-- 現在の請求期間の終了日（プラン有効期限）
ALTER TABLE public.users
  ADD COLUMN stripe_current_period_end TIMESTAMPTZ;

-- インデックス
CREATE INDEX idx_users_stripe_customer_id
  ON public.users(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX idx_users_stripe_subscription_id
  ON public.users(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;
```

### 9.2 カラム一覧と用途

| カラム | 型 | NULL許可 | 用途 |
|--------|-----|---------|------|
| `plan` | TEXT | NOT NULL (default: 'free') | 現在のプラン名（既存: 015_add_plan_column.sql） |
| `stripe_customer_id` | TEXT (UNIQUE) | NULL | Stripe Customer ID (`cus_XXXX`) |
| `stripe_subscription_id` | TEXT (UNIQUE) | NULL | アクティブな Subscription ID (`sub_XXXX`) |
| `stripe_price_id` | TEXT | NULL | 現在適用中の Price ID (`price_XXXX`) |
| `stripe_current_period_end` | TIMESTAMPTZ | NULL | サブスクリプション有効期限 |

### 9.3 TypeScript 型定義の更新

```typescript
// src/lib/types.ts に追加
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  plan: UserPlan;
  // ... 既存フィールド ...

  // Stripe 関連（追加）
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  stripe_current_period_end: string | null;   // ISO 8601 文字列
}
```

### 9.4 サブスクリプション状態の判定ヘルパー

```typescript
// src/lib/subscription.ts
import { createAdminClient } from '@/lib/supabase';
import type { UserPlan } from '@/lib/types';

export interface SubscriptionStatus {
  plan: UserPlan;
  isActive: boolean;
  currentPeriodEnd: Date | null;
  imageLimit: number;
}

const PLAN_LIMITS: Record<UserPlan, number> = {
  free: 10,
  pro: 50,
  business: 200,   // 将来用
};

export async function getSubscriptionStatus(
  userId: string
): Promise<SubscriptionStatus> {
  const supabase = createAdminClient();
  const { data: user } = await supabase
    .from('users')
    .select('plan, stripe_current_period_end')
    .eq('id', userId)
    .single();

  if (!user) {
    return { plan: 'free', isActive: false, currentPeriodEnd: null, imageLimit: 10 };
  }

  const plan = (user.plan as UserPlan) || 'free';
  const periodEnd = user.stripe_current_period_end
    ? new Date(user.stripe_current_period_end)
    : null;

  // Pro/Business の場合、有効期限を確認
  const isActive =
    plan === 'free' ||
    (periodEnd !== null && periodEnd > new Date());

  // 有効期限切れの場合は free にフォールバック
  const effectivePlan = isActive ? plan : 'free';

  return {
    plan: effectivePlan,
    isActive,
    currentPeriodEnd: periodEnd,
    imageLimit: PLAN_LIMITS[effectivePlan],
  };
}
```

### 9.5 将来検討: stripe_events テーブル（オプション）

Webhook イベントのべき等性担保やデバッグ用:

```sql
-- 017_create_stripe_events.sql（オプション）
CREATE TABLE public.stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload JSONB
);

CREATE INDEX idx_stripe_events_type ON public.stripe_events(event_type);
CREATE INDEX idx_stripe_events_processed ON public.stripe_events(processed_at DESC);
```

---

## 10. テストモード vs ライブモード

### 10.1 テストモードの使い方

| 項目 | テストモード | ライブモード |
|------|------------|------------|
| API キー | `pk_test_`, `sk_test_` | `pk_live_`, `sk_live_` |
| 実際の課金 | されない | される |
| ダッシュボード切替 | 左上の「Test mode」トグル | 同上 |
| Webhook URL | ローカル（Stripe CLI）/ Preview URL | 本番 URL |

### 10.2 テストカード番号

| カード番号 | 用途 |
|-----------|------|
| `4242 4242 4242 4242` | **成功**（最も一般的） |
| `4000 0000 0000 3220` | **3D セキュア認証が必要** |
| `4000 0000 0000 0002` | **カード拒否** |
| `4000 0000 0000 9995` | **残高不足** |
| `4000 0000 0000 0341` | **カード番号無効** |

共通の入力値:
- 有効期限: 将来の任意の日付（例: `12/34`）
- CVC: 任意の3桁（例: `123`）
- 郵便番号: 任意（例: `1000001`）

### 10.3 JPY でのテスト

テストモードでも `currency: 'jpy'` で ¥700 のサブスクリプションをテスト可能。Dashboard のテストモードで商品・価格を作成し、`price_test_XXXX` を使用する。

**テストモードで作成した商品・価格とライブモードは完全に分離されている。** ライブモードに移行する際は、ライブモードで改めて商品・価格を作成し、環境変数の Price ID を差し替える。

### 10.4 テストクロック（Subscription テスト用）

Stripe のテストクロック機能で時間を早送りし、サブスクリプションの更新・請求サイクルをテスト可能:

```bash
# テストクロック作成
stripe test_clocks create --frozen-time "2026-02-16T00:00:00Z"

# 時間を1ヶ月先に進める
stripe test_clocks advance tclk_XXXX --frozen-time "2026-03-16T00:00:00Z"
```

---

## 11. Vercel 固有の設定

### 11.1 環境変数の設定

**Vercel Dashboard > Project > Settings > Environment Variables** で設定:

| 変数名 | Production | Preview | Development | 値 |
|--------|-----------|---------|-------------|-----|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ライブ用 pk | テスト用 pk | テスト用 pk | テスト/本番で切替 |
| `STRIPE_SECRET_KEY` | ライブ用 sk | テスト用 sk | テスト用 sk | テスト/本番で切替 |
| `STRIPE_WEBHOOK_SECRET` | 本番用 whsec | テスト用 whsec | - | 環境別に異なる |
| `STRIPE_PRICE_ID_PRO_MONTHLY` | 本番用 price_id | テスト用 price_id | テスト用 price_id | テスト/本番で切替 |
| `NEXT_PUBLIC_APP_URL` | `https://sharemenu-webapp.vercel.app` | 自動 | `http://localhost:3000` | リダイレクト URL 用 |

### 11.2 Webhook URL の設定

#### 本番環境

Stripe Dashboard > Developers > Webhooks > Add endpoint:

```
URL: https://sharemenu-webapp.vercel.app/api/stripe/webhook
Events: checkout.session.completed, customer.subscription.updated,
        customer.subscription.deleted, invoice.payment_succeeded,
        invoice.payment_failed
```

#### Preview 環境の問題

- Vercel の Preview URL（`xxx-yyy.vercel.app`）は毎回変わる
- Stripe Webhook は固定 URL にしか送信できない
- **解決策**:
  1. Preview 環境ではテストモードの Stripe CLI を使う
  2. または固定のステージング URL（カスタムドメイン）を設定する
  3. または `VERCEL_URL` 環境変数を使って動的にするが、Webhook は受け取れない（テストは Stripe CLI で行う）

#### 推奨構成

| 環境 | Webhook 設定 |
|------|-------------|
| ローカル開発 | Stripe CLI → `localhost:3000/api/stripe/webhook` |
| Preview | テスト不要（Webhook なしで UI テストのみ） |
| Production | Stripe Dashboard で固定 URL を登録 |

### 11.3 Vercel の Stripe Integration（オプション）

Vercel は公式の [Stripe Integration](https://github.com/vercel/stripe-integration) を提供している。インストールすると:

- Stripe API キーが自動的に Vercel 環境変数に設定される
- Webhook シークレットも自動設定
- テスト/本番の切替が簡単

ただし、手動設定の方がコントロールしやすいため、手動設定を推奨。

### 11.4 注意: Serverless Function のタイムアウト

Vercel の Serverless Function は:
- **Hobby**: 最大10秒
- **Pro**: 最大60秒（デフォルト10秒）

Webhook 処理は通常数百ミリ秒で完了するため問題ないが、重い処理がある場合は `maxDuration` を設定:

```typescript
// src/app/api/stripe/webhook/route.ts
export const maxDuration = 30; // 秒
```

---

## 12. 日本法令コンプライアンス

### 12.1 特定商取引法に基づく表記（更新が必要）

現在の `/tokushoho` ページは「無料のデモ版」と記載されている。有料プラン提供時には以下を更新する必要がある。

#### 必須記載事項（改正特商法 2022年6月施行対応）

| 項目 | 記載内容 | 現在の状態 |
|------|---------|-----------|
| 販売事業者 | MenuCraft AI 運営事務局 | 記載済み |
| 所在地 | 住所（請求により開示可） | 記載済み |
| 電話番号 | 番号（請求により開示可） | 記載済み |
| メールアドレス | support@menucraft-ai.jp | 記載済み |
| 運営責任者 | 氏名（請求により開示可） | 記載済み |
| **販売価格** | **Pro プラン: 月額¥700（税込）** | **要更新** |
| **支払方法** | **クレジットカード（Visa, Mastercard, JCB, AMEX）** | **要更新** |
| **支払時期** | **申込時に初回決済、以降毎月自動更新** | **要追加** |
| **サービス提供時期** | **お申し込み後、即時ご利用いただけます** | 記載済み |
| **契約期間** | **月単位の自動更新（解約するまで継続）** | **要追加** |
| **解約・キャンセル** | **いつでもマイページから解約可能。解約月の月末まで利用可能。日割り返金なし** | **要更新** |
| **返品・返金** | **デジタルサービスのため返品不可。サービス不具合時は個別対応** | 記載済み（微修正推奨） |

#### 改正特商法（2022年6月施行）の最終確認画面要件

Stripe Checkout の決済ページが「最終確認画面」に該当する。以下の6項目の表示が必須:

1. **分量**: サブスクリプションの場合、月額で何が提供されるか（例: 「月50枚の画像生成」）
2. **販売価格・対価**: 送料・消費税を含めた総額（例: 「月額¥700（税込）」）
3. **支払時期・支払方法**: 決済タイミングと手段（例: 「申込時にクレジットカード決済、以降毎月自動更新」）
4. **引渡・提供時期**: サービス開始時期（例: 「お申込み後、即時利用開始」）
5. **申込期間**: 期間限定の場合のみ（通常は不要）
6. **撤回・解除条件**: キャンセル方法と違約金（例: 「いつでも解約可能、違約金なし」）

**Stripe Checkout での対応方法**:
- Stripe Dashboard > Settings > Checkout settings で「Terms of service」URL を設定
- Product の description に分量や提供内容を明記
- Checkout Session 作成時に `consent_collection` パラメータで利用規約同意を取得

### 12.2 インボイス制度（適格請求書）

2023年10月から施行された日本のインボイス制度への対応:

#### 対応が必要な場合

- 法人顧客（BtoB）が消費税の仕入税額控除を受けるために適格請求書が必要
- MenuCraft AI は飲食店オーナー向け（BtoB）のため、対応推奨

#### Stripe での対応

1. **インボイス登録番号の設定**:
   - Stripe Dashboard > Settings > Business > Tax settings
   - 適格請求書発行事業者登録番号（T + 13桁）を入力

2. **Stripe の請求書に自動表示**:
   - 登録番号を設定すると、Stripe が発行する Invoice / Receipt に自動で記載
   - Customer Portal からユーザーが請求書をダウンロード可能

3. **顧客の Tax ID**:
   - Customer Portal で顧客が自分の Tax ID（インボイス番号）を入力可能に設定
   - 請求書に顧客の Tax ID も記載される

#### 経過措置（2026年9月末まで）

- 2023年10月〜2026年9月: 適格請求書がなくても80%の仕入税額控除が可能
- 2026年10月〜2029年9月: 50%に引き下げ
- 2029年10月〜: 経過措置終了

MenuCraft AI が免税事業者（年間売上1,000万円以下）の場合、即座にインボイス登録事業者になる必要はないが、BtoB 顧客の利便性のために登録を推奨。

### 12.3 消費税の扱い

| 方式 | 説明 | 推奨 |
|------|------|------|
| 内税方式 | ¥700 は消費税込みの総額 | **推奨**（消費者向け表記で分かりやすい） |
| 外税方式 | ¥700 + 消費税¥70 = ¥770 | 非推奨（総額が分かりにくい） |

Stripe での設定:

```typescript
// 内税方式の場合: Price を tax_behavior: 'inclusive' で作成
const price = await stripe.prices.create({
  product: productId,
  unit_amount: 700,
  currency: 'jpy',
  recurring: { interval: 'month' },
  tax_behavior: 'inclusive',   // ¥700 に消費税を含む
});
```

または Stripe Tax を使って自動計算:

```typescript
const session = await stripe.checkout.sessions.create({
  // ...
  automatic_tax: { enabled: true },  // Stripe Tax で自動計算
});
```

---

## 13. 実装チェックリスト

### Phase 1: 基盤構築

- [ ] Stripe アカウント作成（テストモード）
- [ ] テストモードで Pro プラン Product / Price 作成
- [ ] `npm install stripe @stripe/stripe-js`
- [ ] `.env.local` に API キー追加
- [ ] `src/lib/stripe.ts` — サーバーサイド Stripe クライアント初期化
- [ ] `supabase/016_add_stripe_columns.sql` — DB マイグレーション実行
- [ ] `src/lib/types.ts` — UserProfile に Stripe カラム追加

### Phase 2: Checkout & Webhook

- [ ] `src/app/api/stripe/checkout/route.ts` — Checkout Session 作成
- [ ] `src/app/api/stripe/webhook/route.ts` — Webhook ハンドラー実装
- [ ] Stripe CLI でローカル Webhook テスト
- [ ] `src/lib/subscription.ts` — サブスクリプション状態判定ヘルパー

### Phase 3: UI

- [ ] アップグレードボタン（Settings / PricingSection）
- [ ] サブスクリプション管理ボタン（Settings — Customer Portal 連携）
- [ ] 成功/キャンセルページの処理
- [ ] プラン表示の動的切替

### Phase 4: Customer Portal

- [ ] Stripe Dashboard で Customer Portal 設定
- [ ] `src/app/api/stripe/portal/route.ts` — Portal Session 作成
- [ ] Settings ページにポータルリンク追加

### Phase 5: テスト & 本番移行

- [ ] テストカードで全フローの E2E テスト
- [ ] 特定商取引法に基づく表記（`/tokushoho`）更新
- [ ] Vercel Production 環境変数にライブモードキー設定
- [ ] Stripe Dashboard でライブモード Webhook 登録
- [ ] ライブモードで Product / Price 作成、環境変数差替
- [ ] 本番テスト決済 → 返金

---

## 参考リンク

### 公式ドキュメント

- [Stripe Docs: Build a subscriptions integration with Checkout](https://docs.stripe.com/payments/checkout/build-subscriptions)
- [Stripe Docs: Using webhooks with subscriptions](https://docs.stripe.com/billing/subscriptions/webhooks)
- [Stripe Docs: Customer portal](https://docs.stripe.com/customer-management)
- [Stripe Docs: Supported currencies (JPY)](https://docs.stripe.com/currencies)
- [Stripe Docs: Test card numbers](https://docs.stripe.com/testing)
- [Stripe Docs: Stripe CLI](https://docs.stripe.com/stripe-cli/use-cli)
- [Stripe API Reference: Checkout Session](https://docs.stripe.com/api/checkout/sessions/create)
- [Stripe API Reference: Products](https://docs.stripe.com/api/products)
- [Stripe API Reference: Prices](https://docs.stripe.com/api/prices)

### 日本向け

- [Stripe: 特定商取引法に基づく表記](https://stripe.com/resources/more/specified-commercial-transactions-act-japan)
- [Stripe: 改正特商法 Checkout/Payment Links 設定ガイド](https://qiita.com/hideokamoto/items/9ca5845a4f68dae808fd)
- [Stripe: インボイス制度対応](https://stripe.com/guides/japan-invoice-system)
- [Stripe: 日本の適格請求書とは](https://stripe.com/resources/more/qualified-invoices-in-japan)
- [Stripe Support: Commerce Disclosure ページの作成方法](https://support.stripe.com/questions/how-to-create-and-display-a-commerce-disclosure-page)

### Next.js + Stripe 統合ガイド

- [Stripe + Next.js 15: The Complete 2025 Guide](https://www.pedroalonso.net/blog/stripe-nextjs-complete-guide-2025/)
- [Stripe Subscriptions in Next.js](https://www.pedroalonso.net/blog/stripe-subscriptions-nextjs/)
- [Vercel: Getting started with Next.js, TypeScript, and Stripe](https://vercel.com/kb/guide/getting-started-with-nextjs-typescript-stripe)
- [Vercel: Subscription Starter Template](https://vercel.com/templates/next.js/subscription-starter)
- [Auth.js + Stripe Integration Guide](https://www.achromatic.dev/blog/stripe-authjs-integration)
- [Next.js App Router + Stripe Webhook Signature Verification](https://kitson-broadhurst.medium.com/next-js-app-router-stripe-webhook-signature-verification-ea9d59f3593f)

### npm パッケージ

- [stripe (npm)](https://www.npmjs.com/package/stripe) — v20.3.1
- [@stripe/stripe-js (npm)](https://www.npmjs.com/package/@stripe/stripe-js)
- [stripe-node (GitHub)](https://github.com/stripe/stripe-node)
