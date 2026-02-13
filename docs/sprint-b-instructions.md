# Sprint B（ダッシュボード再構築 + 設定Tier 3）— 業務指示書

**作成日**: 2026-02-13
**対象**: エンジニアエージェント
**プロジェクト**: `/Users/arumamurata/claude/any_menucraft_AI/menucraft-web`
**ブランチ**: `develop` から `feature/sprint-b` を作成して作業
**前提**: Sprint 1, 2-3, A が完了済み。ダッシュボードはPR #58でrevertされた状態。

---

## 背景

Sprint 2-3（PR #56）でダッシュボードの2カラム化・ウェルカムエリア刷新・+新規作成カードを実装したが、デザイン品質の問題によりPR #58で5ファイルがrevertされた。

**revert対象（現在は元のデザインに戻っている）:**
- `src/app/dashboard/page.tsx` (160行)
- `src/components/dashboard/DashboardHeader.tsx` (45行)
- `src/components/dashboard/SessionGrid.tsx` (97行)
- `src/components/dashboard/StatsSection.tsx` (82行)
- `src/components/dashboard/QuickActions.tsx` (35行)

**revert対象外（Sprint 2-3の成果として維持されている）:**
- 設定画面: GenerationDefaultsSection, UsageSection
- API: GET/PATCH /api/account/settings, GET /api/account/usage
- SEO: OGP画像、sitemap.ts、robots.txt
- チャット連携: プロフィール自動注入
- テスト: account-settings, account-usage, greeting

本Sprintではダッシュボードを**段階的に改善**し、設定画面Tier 3の機能を追加する。

---

## Part 1: ダッシュボード改善（#36, #37, #39 再実装）

### 方針

前回のrevertの教訓を踏まえ、以下の方針で進める:

1. **既存レイアウト（1カラム）を壊さない**: 2カラム化はせず、現在の縦積みレイアウトを維持したまま改善する
2. **小さな変更を積み重ねる**: 1タスク1コミットで、各段階でビルド確認
3. **既存デザインパターンを厳守**: Phase A-Cで確立したビジュアルパターン（ブラーサークル、アクセントバー、fadeInUp、hover FX）に従う

---

### Task 1: ウェルカムエリア刷新 — #37（優先度: 高）

**現状:** `DashboardHeader.tsx`（45行）はシンプルなヘッダーのみ。

**やること:**

`src/components/dashboard/DashboardHeader.tsx` を改修:

- 時間帯挨拶を表示: 既存の `src/lib/greeting.ts` を使用
  - 5-11時: 「おはようございます」
  - 11-17時: 「こんにちは」
  - 17-5時: 「こんばんは」
- ユーザー名表示: 「{name}さん、{挨拶}」
- 状態に応じたサブメッセージ:
  - セッション0件: 「最初のメニュー画像を作ってみましょう！」
  - 画像生成済み: 「今月 {n}枚 のメニュー画像を作成しました」
  - Free上限近い（セッション2/3以上）: 「今月の残りセッション: {n}件」

**デザイン:**
- 既存のヘッダースタイル（英語ラベル + 日本語見出し + サブテキスト + 装飾ドットパターン）を維持
- Playfair Display でユーザー名を強調
- `animate-fade-in-up` でフェードイン

**データ:** `useDashboardData` フックから `userName` と `stats` を受け取る（既にpropsとして利用可能なはず。不足していれば追加）

**制約:**
- **DashboardHeader のProps型を変更する場合、page.tsx 側も合わせて修正すること**
- レイアウトの大幅変更はしない。テキスト内容の改善のみ

---

### Task 2: +新規作成カード — #39（優先度: 高）

**現状:** `SessionGrid.tsx`（97行）はセッションカード一覧のみ表示。

**やること:**

`src/components/dashboard/SessionGrid.tsx` を改修:

- グリッドの**先頭**に「+ 新しいメニューを作成」カードを追加
- クリックで `/chat` に遷移（`router.push("/chat")` ではなく、既存の `handleCreateNew` 関数を呼ぶ。プラン制限チェックが含まれているため）

**デザイン:**
- 既存の SessionCard と同じサイズ・角丸（`rounded-[20px]`）
- 破線ボーダー: `border-2 border-dashed border-border-light`
- 中央に `+` アイコン + 「新しいメニューを作成」テキスト
- ホバー: `border-accent-warm` + `text-accent-warm` に変化 + `translateY(-2px)`
- `animate-fade-in-up` でフェードイン

**制約:**
- `handleCreateNew` はプラン制限チェック（Free: 3セッション/月）を含んでいるので、必ずこの関数経由でセッション作成すること
- セッションが0件の場合も新規作成カードは表示する

---

### Task 3: ダッシュボードレイアウト微調整 — #36（優先度: 中）

**方針変更:** 2カラム化ではなく、既存の1カラムレイアウトの**セクション順序と余白を最適化**する。

**やること:**

`src/app/dashboard/page.tsx` のセクション順序を確認し、以下の順序に整理:

```
1. DashboardHeader（ウェルカムエリア）
2. QuickActions（クイックアクション）
3. StatsSection（統計カード）
4. SessionGrid（セッション一覧 + 新規作成カード）
5. GalleryStatsSection（ギャラリー統計）
6. AchievementSection（バッジ）
7. AdPlaceholder（広告枠）
8. CommonFooter
```

- 各セクション間の余白を統一（`space-y-8` or `gap-8`）
- セクション間に区切り線は入れない（カードの上端アクセントバーで十分）

**制約:**
- 既存のコンポーネント呼び出しとProps受け渡しを変更しない
- 順序変更とスペーシング調整のみ

---

### Task 4: インサイトカード指標の改善 — #41（優先度: 低）

**やること:**

`src/components/dashboard/StatsSection.tsx` の統計カードを確認し、以下の指標が含まれているか確認:

- 総生成数（画像数）
- 公開数（ギャラリーに共有した数）
- セッション数
- 今月の残りセッション数（Freeプラン時のみ表示）

不足していれば追加。ただし `useDashboardData` から取得できるデータの範囲内で対応。新規API追加はしない。

---

## Part 2: 設定画面 Tier 3（#50, #51）

### Task 5: プライバシー設定 — #50（優先度: 中）

**概要:** AI学習オプトアウト・ギャラリー公開時の店名表示・使用状況データ共有の3つのトグル設定。

**やること:**

#### 5-1. コンポーネント作成

`src/components/settings/PrivacySection.tsx` を新規作成:

- Sprint 1で作成済みの `SettingsCard` を使用
- トグル3つ:

| 項目 | デフォルト | 説明テキスト |
|------|:---:|------|
| AI学習へのデータ提供 | ON | 「アップロード画像・チャット内容をAIモデルの改善に利用します」 |
| ギャラリー公開時の店名表示 | ON | 「ギャラリーに画像を共有する際、店舗名を表示します」 |
| 使用状況データの共有 | ON | 「サービス改善のための匿名利用データを共有します」 |

- **即時保存**: トグル切り替え時に即座に `PATCH /api/account/settings` を呼ぶ（保存ボタン不要）
- 保存中はトグルを一時的にdisabledにし、完了後に復帰
- エラー時はトグルをロールバック + エラーtoast表示

#### 5-2. 共通トグルコンポーネント

`src/components/settings/shared/SettingsToggle.tsx` を新規作成:
- Props: `label`, `description`, `checked`, `onChange`, `disabled`
- アクセシブルなトグルスイッチ（`<button role="switch">` or `<input type="checkbox">` + カスタムスタイル）
- ON: accent-warm背景。OFF: bg-border-light背景
- `transition-colors duration-200` でスムーズな切り替え

#### 5-3. user_settings テーブル確認

Sprint 1で作成した `supabase/011_create_user_settings.sql` に `ai_data_usage`, `gallery_show_shop_name`, `analytics_data_sharing` カラムが既に含まれているはず。含まれていなければ ALTER TABLE で追加。

#### 5-4. 設定ページ + Sidenav

- `settings/page.tsx` に PrivacySection を追加
- `SettingsSidenav` に「プライバシー」項目を追加

---

### Task 6: 通知設定 — #51（優先度: 中）

**概要:** メール通知の種別ごとON/OFF制御。

**やること:**

#### 6-1. DBマイグレーション

`supabase/012_create_notification_preferences.sql` を確認。Sprint 2-3の実装計画に含まれているはず。存在しなければ作成:

```sql
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  new_features boolean NOT NULL DEFAULT true,
  generation_complete boolean NOT NULL DEFAULT true,
  gallery_reactions boolean NOT NULL DEFAULT true,
  marketing boolean NOT NULL DEFAULT false,
  email_frequency text NOT NULL DEFAULT 'realtime'
    CHECK (email_frequency IN ('realtime', 'daily', 'weekly', 'off')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_prefs_user_id ON public.notification_preferences(user_id);

CREATE TRIGGER update_notification_prefs_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
```

#### 6-2. API拡張

`GET/PATCH /api/account/settings` に notifications セクションを追加:

```typescript
// レスポンスに追加
notifications: {
  new_features: boolean;        // 新機能のお知らせ
  generation_complete: boolean;  // 画像生成完了
  gallery_reactions: boolean;    // ギャラリーの反応
  marketing: boolean;            // マーケティングメール
  email_frequency: "realtime" | "daily" | "weekly" | "off";
}
```

- GET: notification_preferences が未作成の場合、デフォルト値で自動作成（upsert）
- PATCH: 部分更新対応

#### 6-3. コンポーネント作成

`src/components/settings/NotificationSection.tsx` を新規作成:

- `SettingsCard` + `SettingsToggle`（Task 5で作成）を使用
- トグル4つ:

| 項目 | デフォルト | 説明 |
|------|:---:|------|
| 新機能のお知らせ | ON | 「サービスアップデート情報をお届けします」 |
| 画像生成完了 | ON | 「画像生成が完了した際に通知します」 |
| ギャラリーの反応 | ON | 「いいね・保存された時に通知します」 |
| マーケティングメール | OFF | 「キャンペーンやお得な情報をお届けします」 |

- メール受信頻度セレクト:

| 選択肢 | 値 |
|--------|-----|
| リアルタイム | realtime |
| 日次まとめ | daily |
| 週次まとめ | weekly |
| 受け取らない | off |

- **即時保存**: トグル/セレクト変更時に即座に `PATCH /api/account/settings` を呼ぶ
- 「受け取らない」選択時は全トグルをグレーアウト表示

#### 6-4. 設定ページ + Sidenav

- `settings/page.tsx` に NotificationSection を追加
- `SettingsSidenav` に「通知」項目を追加

---

## Part 3: 残件整理

### Task 7: 広告枠の配置改善 — #38（優先度: 低・スキップ可）

**現状確認:** `AdPlaceholder` コンポーネントの現在の配置を確認。チャット入力直上にある場合、ダッシュボード下部またはサイドに移動。

**やること:**
- ダッシュボードでは最下部（CommonFooterの直前）に配置
- チャット画面での配置を確認し、入力エリアの邪魔にならない位置に移動
- `AdPlaceholder` 自体のデザインは変更不要

---

## 設定ページ Sidenav 最終構成

```
○ プロフィール      ← Sprint 1で実装済み
○ 生成デフォルト    ← Sprint 2-3で実装済み
○ プラン           ← 既存
○ セキュリティ      ← 既存
○ 使用状況         ← Sprint 2-3で実装済み
○ 通知            ← 本Sprint (Task 6)
○ プライバシー      ← 本Sprint (Task 5)
○ 退会            ← 既存
```

---

## 完了基準

- [ ] `npm run build` がエラーなく通る
- [ ] `npm test` が全テストパス
- [ ] ダッシュボードのウェルカムエリアに時間帯挨拶 + 状態メッセージが表示される (#37)
- [ ] セッショングリッド先頭に新規作成カードがあり、クリックでチャット画面に遷移する (#39)
- [ ] ダッシュボードのレイアウトが崩れておらず、既存デザインパターンを維持している (#36)
- [ ] 設定画面にプライバシーセクション（トグル3つ）が追加されている (#50)
- [ ] 設定画面に通知設定セクション（トグル4つ + 頻度セレクト）が追加されている (#51)
- [ ] トグル変更が即時保存される
- [ ] SettingsSidenav が8項目に更新されている
- [ ] 全作業を `feature/sprint-b` ブランチで行い、developへのPRを作成
- [ ] PRの説明に対応Issue番号（#36, #37, #39, #50, #51）を記載

---

## 工数見積・優先順位

**合計: 2〜3日**

| 順序 | タスク | 工数 | 対応Issue | スキップ可 |
|:---:|--------|:---:|:---:|:---:|
| 1 | Task 1: ウェルカムエリア刷新 | S | #37 | ✗ |
| 2 | Task 2: +新規作成カード | S | #39 | ✗ |
| 3 | Task 5: プライバシー設定 | M | #50 | ✗ |
| 4 | Task 6: 通知設定 | M | #51 | ✗ |
| 5 | Task 3: ダッシュボードレイアウト調整 | S | #36 | ○ |
| 6 | Task 4: インサイトカード改善 | S | #41 | ○ |
| 7 | Task 7: 広告枠配置改善 | S | #38 | ○ |

**重要: ダッシュボード変更は必ず各Task完了時にビルド確認すること。前回のrevertの教訓として、小さな単位でコミットを切る。**
