# 本番運用移行計画

作成日: 2026-02-16
対象: 代表者打ち合わせ用（2026-02-17）

---

## 1. 前提: 無料プランでの本番運用は不可

### Vercel（ホスティング）

| プラン | 月額 | 商用利用 | 備考 |
|--------|------|---------|------|
| Hobby（無料） | $0 | **不可** | 個人・非商用のみ。収益を生むサービスは規約違反 |
| **Pro** | **$20（¥3,000）** | **可** | 1TB 帯域、SSL 自動設定、商用利用可 |

> Vercel の利用規約により、広告表示や課金を含むサービスは Pro プラン以上が必須。

### Supabase（データベース・ストレージ）

| プラン | 月額 | 本番利用 | 備考 |
|--------|------|---------|------|
| Free | $0 | **非推奨** | DB 500MB、7日無通信で**プロジェクト自動停止** |
| **Pro** | **$25（¥3,750）** | **推奨** | DB 8GB、自動バックアップ、停止なし |

> Free プランは7日間アクセスがないと DB が停止する。SaaS として致命的。

---

## 2. 月額費用シミュレーション

### 最小構成（ユーザー 〜50人）

| 項目 | 月額（USD） | 月額（JPY） |
|------|-----------|------------|
| Vercel Pro | $20 | ¥3,000 |
| Supabase Pro | $25 | ¥3,750 |
| ドメイン | ~$1 | ¥150 |
| 画像生成 API（Batch） | ~$7 | ¥1,050 |
| **固定費合計** | **~$53** | **~¥7,950** |

### 成長期（ユーザー 50〜300人）

| 項目 | 月額（USD） | 月額（JPY） |
|------|-----------|------------|
| Vercel Pro | $20 | ¥3,000 |
| Supabase Pro | $25 | ¥3,750 |
| ドメイン | ~$1 | ¥150 |
| Google Pro 契約（画像生成） | $20 | ¥3,000 |
| **固定費合計** | **~$66** | **~¥9,900** |

### 損益分岐点

| 構成 | 固定費/月 | 損益分岐 Pro ユーザー数 |
|------|----------|----------------------|
| 最小構成 | ¥7,950 | **12人**（¥8,400） |
| 成長期構成 | ¥9,900 | **15人**（¥10,500） |

---

## 3. 本番移行作業

### Phase 1: インフラ整備（1〜2日）

| # | 作業 | 詳細 | 工数 |
|---|------|------|------|
| 1 | Vercel Pro アップグレード | チームアカウント作成、課金開始 | 30分 |
| 2 | Supabase Pro アップグレード | 課金開始、DB 停止リスク解消 | 30分 |
| 3 | カスタムドメイン設定 | DNS 設定、Vercel で SSL 自動 | 1時間 |
| 4 | 環境変数の本番設定 | API キー、`DEMO_MODE=false` | 30分 |

### Phase 2: 決済連携（3〜5日）

| # | 作業 | 詳細 | 工数 |
|---|------|------|------|
| 5 | Stripe アカウント開設 | 本番 + テストモード | 1時間 |
| 6 | Stripe Checkout 実装 | Pro プラン ¥700/月の購読フロー | 4〜6時間 |
| 7 | Stripe Webhook 実装 | 支払成功/失敗/解約 → `plan` カラム自動更新 | 3〜4時間 |
| 8 | Stripe Customer Portal | ユーザー自身でプラン変更・解約できる画面 | 2〜3時間 |
| 9 | キャンペーンコード機能 | 後述（Section 4） | 3〜4時間 |

### Phase 3: 運用基盤（1〜2日）

| # | 作業 | 詳細 | 工数 |
|---|------|------|------|
| 10 | 画像生成エンジン切替 | Gemini 2.0 Flash → Nano Banana Pro | 2〜3時間 |
| 11 | エラー監視導入 | Sentry Free（月5K イベント） | 1時間 |
| 12 | メール送信設定 | Resend Free（100通/日）— パスワードリセット・通知 | 2〜3時間 |
| 13 | DB バックアップ確認 | Supabase Pro 自動バックアップの動作確認 | 30分 |

### Phase 4: 法務・テスト・公開（1〜2日）

| # | 作業 | 詳細 | 工数 |
|---|------|------|------|
| 14 | 特商法ページ更新 | 実際の事業者情報・連絡先に更新 | 1時間 |
| 15 | 利用規約・プライバシーポリシー | 法務チェック、必要に応じて改訂 | 要確認 |
| 16 | 本番環境テスト | 全機能の動作確認（決済フロー含む） | 3〜4時間 |
| 17 | デモモード無効化 | `DEMO_MODE=false`、デモアカウント削除 | 30分 |

### 全体工数

| フェーズ | 工数 |
|---------|------|
| Phase 1: インフラ | 0.5日 |
| Phase 2: 決済 | 3〜4日 |
| Phase 3: 運用基盤 | 1〜2日 |
| Phase 4: テスト・公開 | 1〜2日 |
| **合計** | **約1〜2週間** |

---

## 4. キャンペーンコード機能

### 概要

初期のユーザー獲得施策として、飲食店にダイレクトメール（DM）を送付し、アカウント登録後にキャンペーンコードを入力すると **Pro プラン1ヶ月無料** で利用できる仕組み。

### ユーザーフロー

```
1. DM を受け取る（ネオ居酒屋、カフェ、レストラン等）
2. QR コードまたは URL から LP にアクセス
3. アカウント登録（通常の Free プラン）
4. 設定画面 or 登録直後にキャンペーンコード入力欄
5. コード入力 → Pro プランが1ヶ月間有効化
6. 1ヶ月後 → 自動で Free に戻る or Stripe で継続課金
```

### DB 設計

```sql
-- キャンペーンコードテーブル
CREATE TABLE public.campaign_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,          -- 例: "NEOISAKAYA2026"
  description TEXT,                    -- 管理用メモ
  plan TEXT NOT NULL DEFAULT 'pro',    -- 適用プラン
  duration_days INTEGER NOT NULL DEFAULT 30,  -- 有効日数
  max_uses INTEGER,                    -- 最大使用回数（NULL=無制限）
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,             -- コード自体の有効期限
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- コード使用履歴
CREATE TABLE public.campaign_code_uses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id uuid REFERENCES campaign_codes(id),
  user_id uuid REFERENCES users(id),
  activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,    -- このユーザーの Pro 有効期限
  UNIQUE(code_id, user_id)            -- 同一コードは1人1回
);
```

### コード例

| コード | 対象 | 有効期間 | 最大使用回数 |
|--------|------|---------|------------|
| `NEOISAKAYA2026` | ネオ居酒屋向け DM | 30日 Pro | 100回 |
| `CAFE2026` | カフェ向け DM | 30日 Pro | 100回 |
| `LAUNCH` | ローンチ記念 | 30日 Pro | 500回 |
| `PARTNER-XXX` | 提携先個別コード | 30日 Pro | 50回 |

### マーケティング施策との連動

- **DM にコードを印刷** — 物理的な DM に QR コード + キャンペーンコードを記載
- **コード別の効果測定** — `campaign_code_uses` で DM チャネルごとの登録率を計測
- **期間限定感** — `expires_at` でコードに有効期限を設定し、早期登録を促進
- **Admin 画面での管理** — コード作成・使用状況確認・無効化を Admin UI から操作

### 実装工数

| 作業 | 工数 |
|------|------|
| DB テーブル作成 | 30分 |
| コード検証 API | 1時間 |
| コード入力 UI（設定画面 or 登録後） | 1〜2時間 |
| Pro 有効期限の自動管理（期限切れで Free に戻す） | 1〜2時間 |
| Admin コード管理画面 | 2〜3時間 |
| **合計** | **5〜8時間** |

---

## 5. 代表者への説明ポイント

### 必ず伝えること

1. **無料での本番運用は不可** — Vercel・Supabase とも有料プランが必須（利用規約・稼働安定性）
2. **最低月額 ¥8,000〜10,000** — ユーザーがゼロでもかかる固定費
3. **Pro ユーザー 12〜15人で黒字化** — それまでは投資期間
4. **移行期間は約1〜2週間** — 最大の工数は Stripe 決済連携
5. **決済がないと Pro を売れない** — Stripe 連携は本番運用の前提条件

### 判断を仰ぐこと

| 項目 | 選択肢 | 備考 |
|------|--------|------|
| カスタムドメイン | 新規取得 or 既存ドメイン使用 | `menucraft.jp` 等 |
| 特商法の事業者情報 | 会社名・住所・連絡先 | 法的要件 |
| DM 送付先リスト | 自社調達 or 外部リスト | 初期ユーザー獲得 |
| ローンチ時期 | いつまでに本番化したいか | 工数1〜2週間を逆算 |
| 初期キャンペーン予算 | DM 印刷・発送費用 | Pro 無料分は API コストのみ |

---

## 6. 参考リンク

- [Vercel Pricing](https://vercel.com/pricing)
- [Vercel Hobby Plan — 商用利用不可](https://vercel.com/docs/plans/hobby)
- [Vercel Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines)
- [Supabase Pricing](https://supabase.com/pricing)
- [Supabase Production Checklist](https://supabase.com/docs/guides/deployment/going-into-prod)
- [Stripe Docs — Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)
