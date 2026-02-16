# モバイル最適化 — 設計・実装計画

作成日: 2026-02-16
担当: デザイナー + フロントエンドエンジニア

---

## 1. 現状分析

### 対応済み（変更不要）

| 領域 | 状態 | 備考 |
|------|------|------|
| LP ヘッダー | ハンバーガーメニュー `md:hidden` | 完成度高 |
| AppSidebar | モバイルオーバーレイ + バックドロップ | `xl:` で切替 |
| AppLayout | ハンバーガーボタン `xl:hidden` | 確立済みパターン |
| Gallery グリッド | `grid-cols-1 → 2 → 3` | 対応済み |
| ChatInput | `sm:` / `md:` レスポンシブ | 概ね良好 |
| PreviewPanel | `lg:` 以上で右パネル、モバイルで固定オーバーレイ | 動作はするが改善余地あり |

### 要対応

| 問題 | 影響度 | 対象ファイル |
|------|--------|------------|
| viewport meta tag 未設定 | **クリティカル** | `src/app/layout.tsx` |
| Admin サイドバー固定幅 `w-[220px]` | **高** | `src/app/admin/layout.tsx` |
| Admin テーブル溢れ（5〜7カラム） | **高** | 6ページ |
| Admin メイン `p-8` がモバイルで大きすぎ | 中 | `src/app/admin/layout.tsx` |
| 一部ボタンのタップターゲット不足 | 中 | 複数ファイル |

---

## 2. 設計方針

### Admin サイドバー — AppSidebar パターンの踏襲

既存の `AppSidebar.tsx` + `AppLayout.tsx` で確立されたパターンをそのまま適用する。

- `mobileOpen` 状態（useState）でサイドバー表示/非表示を制御
- `fixed` + `translate-x` アニメーションによるスライドイン
- `bg-black/30` バックドロップオーバーレイ
- ナビリンクタップ時に自動クローズ
- ブレークポイント: `xl:1280px`（AppLayout と統一）

### テーブル — 2パターンの使い分け

| パターン | 適用基準 | メリット |
|---------|---------|---------|
| **A. 横スクロール + カラム非表示** | カラム多数、データ比較が重要 | テーブル構造維持、実装が軽い |
| **B. カード変換** | アクション付き、少〜中カラム | タッチ操作しやすい |

各テーブルの適用:

| ページ | カラム数 | パターン | モバイル表示カラム | 非表示カラム |
|--------|---------|---------|-----------------|------------|
| users | 7 | A | 名前, ロール, ステータス | メール, 登録日, セッション, 画像 |
| sessions | 6 | A | 店名, ステータス, 更新日 | ユーザー, メッセージ, 画像 |
| api-logs | 7 | A | 種別, ステータス, 応答時間, 日時 | モデル, トークン, ユーザー |
| release-notes | 6 | A | バージョン, タイトル, ステータス, 操作 | カテゴリ, 日付 |
| revenue | 5 | A | Name, Sessions, Images | Email, 登録日 |
| prompts | 3 | A | 全表示 | なし（カラム少） |

### タッチ操作

- タップターゲット: 最低 44x44px（WCAG 2.5.5）
- スワイプ: P2 で Admin サイドバーの左端スワイプ展開を検討

---

## 3. 対象ファイル一覧

| # | ファイル | 変更内容 | 優先度 |
|---|---------|---------|--------|
| 1 | `src/app/layout.tsx` | `viewport` エクスポート追加 | P0 |
| 2 | `src/app/admin/layout.tsx` | モバイルサイドバー + ハンバーガー + padding 修正 | P0-P1 |
| 3 | `src/app/admin/users/page.tsx` | `overflow-x-auto` + `hidden md:table-cell` | P1 |
| 4 | `src/app/admin/sessions/page.tsx` | `overflow-x-auto` + `hidden md:table-cell` | P1 |
| 5 | `src/app/admin/api-logs/page.tsx` | `hidden md:table-cell`（overflow-x-auto 済） | P1 |
| 6 | `src/app/admin/release-notes/page.tsx` | `overflow-x-auto` + カラム非表示 + フォーム grid | P1 |
| 7 | `src/app/admin/revenue/page.tsx` | `overflow-x-auto` + カラム非表示 | P1 |
| 8 | `src/app/admin/moderation/page.tsx` | 統計カード `grid-cols-1 sm:grid-cols-3` | P1 |
| 9 | `src/app/admin/prompts/page.tsx` | `overflow-x-auto`（軽微） | P1 |

**新規ファイル: 不要。** 既存コンポーネントの修正のみで対応可能。

---

## 4. 実装計画

### P0 — 即対応（30分）

#### P0-1: viewport meta tag

```typescript
// src/app/layout.tsx に追加
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};
```

- `maximum-scale=5`（ピンチズーム許可、WCAG 準拠）
- `user-scalable=no` は使わない

#### P0-2: Admin メインの padding 修正

```
p-8  →  p-4 sm:p-6 xl:p-8
```

### P1 — 高優先度（2.5 時間）

#### P1-1: Admin サイドバーのモバイル対応（1 時間）

変更サマリ:

| 箇所 | Before | After |
|------|--------|-------|
| header px | `px-6` | `px-4 sm:px-6` |
| ハンバーガーボタン | なし | `xl:hidden` で追加 |
| 「ユーザー画面に戻る」 | 常時表示 | `hidden sm:inline` |
| aside 配置 | 常時 static | `fixed -translate-x-full` + `xl:static xl:translate-x-0` |
| バックドロップ | なし | `mobileOpen && <div>` overlay |
| nav Link | `onClick` なし | `onClick={() => setMobileOpen(false)}` |
| 状態管理 | なし | `useState(false)` for `mobileOpen` |

#### P1-2〜P1-7: テーブル対応（1.5 時間）

各テーブルに共通の変更:

**Step 1:** テーブルラッパーに `overflow-x-auto` を追加

```tsx
// Before
<div className="... overflow-hidden">
// After
<div className="... overflow-x-auto">
```

**Step 2:** 重要度の低いカラムに `hidden md:table-cell` を追加

```tsx
// 例: users ページのメール列
<th className="hidden md:table-cell ...">メール</th>
<td className="hidden md:table-cell ...">{u.email}</td>
```

#### P1-8: moderation・release-notes の grid 修正（5分）

```tsx
// grid-cols-3 → grid-cols-1 sm:grid-cols-3
// grid-cols-2 → grid-cols-1 sm:grid-cols-2
```

### P2 — 中優先度（将来対応）

| タスク | 工数 |
|--------|------|
| PreviewPanel モバイル UX 改善（全幅化 + フッター固定） | 1〜2h |
| ChatInput タップターゲット拡大（44x44px） | 30min |
| Admin サイドバー左端スワイプ展開 | 1〜2h |
| 全ボタン/リンクのタップターゲット監査 | 2h |
| PreviewPanel ボトムシート化 | 3〜4h |

---

## 5. 工数見積

| フェーズ | 工数 |
|---------|------|
| P0（viewport + padding） | 30分 |
| P1（Admin サイドバー + テーブル全体） | 2.5時間 |
| **P0 + P1 合計** | **約 3 時間** |
| P2（将来対応） | 7〜10 時間 |

---

## 6. テスト方針

### 検証ブレークポイント

- **375px** — iPhone SE（最小モバイル）
- **390px** — iPhone 14
- **768px** — iPad（タブレット）
- **1280px** — xl ブレークポイント（サイドバー切替境界）
- **1440px+** — デスクトップ

### チェックリスト

**P0:**
- [ ] `<meta name="viewport">` が正しく出力されること
- [ ] Admin メインコンテンツのパディングが適切であること

**P1 — Admin レイアウト:**
- [ ] 375px: サイドバー非表示、ハンバーガーボタン表示
- [ ] 375px: ハンバーガータップでサイドバーがスライドイン
- [ ] 375px: バックドロップ表示、タップで閉じる
- [ ] 375px: ナビリンクタップで閉じて遷移
- [ ] 1280px+: サイドバー常時表示、ハンバーガー非表示

**P1 — テーブル:**
- [ ] 375px: 各テーブルで主要カラムのみ表示
- [ ] 375px: テーブルが画面幅を超える場合に横スクロール可能
- [ ] 768px+: 全カラム表示

**回帰:**
- [ ] ユーザー画面（dashboard, chat, gallery, settings）のレスポンシブが壊れていないこと
- [ ] AppSidebar のモバイル動作に影響がないこと
- [ ] LP ヘッダーのハンバーガーメニューに影響がないこと
- [ ] `npm run build` 成功
