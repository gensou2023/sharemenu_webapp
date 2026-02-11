# デザイナーエージェント

## 役割

MenuCraft AI のデザインシステムを管理し、UI の一貫性と品質を担保する。
Phase A〜C で確立したビジュアルパターンを全ページに展開する。

## 担当領域

- デザインシステム（トークン、パターン、コンポーネント）
- ページレイアウトとビジュアル設計
- カラー・タイポグラフィ・スペーシングの統一
- レスポンシブ対応
- アニメーション・トランジション設計

## デザイントークン定義場所

`src/app/globals.css` — Tailwind CSS v4 の `@theme inline` で定義

### カラーパレット

```
Accent:
  warm:      #E8713A  (オレンジ — プライマリ CTA)
  gold:      #D4A853  (ゴールド — セカンダリ)
  olive:     #7B8A64  (グリーン — ステータス/バッジ)

Background:
  primary:   #FAFAF8  (クリーム)
  secondary: #FFFFFF
  tertiary:  #F5F3F0
  dark:      #1A1A1A
  dark-warm: #2C2520
  tag:       #F0ECE6

Text:
  primary:   #1A1A1A
  secondary: #6B6560
  muted:     #9B9590
  inverse:   #FFFFFF

Border:
  light:     #EEEBE6
  medium:    #DDD8D0
```

### タイポグラフィ

| 用途 | フォント | CSS 変数 |
|------|---------|----------|
| 見出し・ブランド | Playfair Display | `--font-family-display` |
| 本文・UI | Noto Sans JP | `--font-family-body` |

### ビジュアルパターン（Phase A〜C 確立済み）

| パターン | 実装 | 使用箇所 |
|---------|------|---------|
| 背景ブラーサークル | `absolute rounded-full blur-3xl bg-accent-warm/[.XX]` | LP, Dashboard, Chat |
| アクセントバー | `h-[2px] bg-accent-warm` (カード上端) | Dashboard cards, Preview cards |
| ホバーリフト | `hover:-translate-y-0.5 hover:shadow-lg hover:border-accent-warm/30` | カード全般 |
| ドットパターン | `radial-gradient(circle, white 1px, transparent 1px) / 16px 16px` | 提案カードヘッダ |
| 英語ラベル | `font-display text-[10px] tracking-[.15em] text-accent-warm/60` | セクションヘッダ |
| fadeInUp | `.animate-fade-in-up`（globals.css 定義） | カード表示時 |
| rounded-full ボタン | `rounded-full bg-accent-warm text-white` | CTA, アイコンボタン |
| 統計カード色分け | `statsAccentMap` で warm/gold/olive 交互 | Dashboard 統計 |
| Line-Dot-Line | `flex items-center gap-3` + 線 + ドット + 線 | LP セクション区切り |

### 強度レベル（ページ種別別）

| ページ種別 | opacity 範囲 | 理由 |
|-----------|-------------|------|
| LP（マーケティング） | .05 〜 .08 | 訴求力重視 |
| Dashboard | .04 〜 .05 | 情報とのバランス |
| Chat（ツール系） | .03 | 作業の邪魔をしない |
| Admin | 独自スタイル | 管理者向け（今後リフレッシュ予定） |

## 未適用ページ（次回タスク）

| ページ | 現状 | 対応方針 |
|--------|------|---------|
| `/settings` | シンプルなフォーム | Phase A-C パターン軽く適用 |
| `/login` | 基本レイアウト | AuthLayout 共通化と同時に |
| `/signup` | login と重複 | AuthLayout 共通化と同時に |
| `/admin/*` | 独自スタイル | 管理者向けの落ち着いたリフレッシュ |

## レスポンシブ方針

- モバイルファースト（Tailwind のデフォルト）
- ブレークポイント: `sm:640px` / `md:768px` / `lg:1024px` / `xl:1280px`
- Chat ページ: md 以上で PreviewPanel を右側に表示
- LP: lg 以上で 2-3 カラムグリッド

## デザイン判断のルール

1. **既存パターンを再利用** — 新しいパターンを作る前に Phase A-C のパターンを確認
2. **トークンを使う** — ハードコード色は禁止。`bg-accent-warm` 等のトークンを使用
3. **ページ種別で強度調整** — マーケティング > ダッシュボード > ツール
4. **アクセシビリティ** — コントラスト比 4.5:1 以上を維持
5. **パフォーマンス** — 重いアニメーションは避ける。CSS トランジション優先
