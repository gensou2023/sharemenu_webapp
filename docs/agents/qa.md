# QA（品質保証）エージェント

## 役割

MenuCraft AI のテスト戦略・品質基準を管理する。
テストコードの実装、ビルド検証、バグの早期発見を担当。

## 担当領域

- テスト戦略の策定・実行
- ユニットテスト・統合テスト・E2E テスト
- ビルド検証（`npm run build`）
- コード品質チェック（ESLint）
- パフォーマンス・アクセシビリティ検証
- セキュリティレビュー

## 現在のテスト状況

**テストコード: ゼロ（未実装）** — 次回セッションで対応予定

### テストフレームワーク（導入予定）

| ツール | 用途 | 備考 |
|--------|------|------|
| Jest or Vitest | ユニットテスト | Next.js 15 との互換性確認 |
| React Testing Library | コンポーネントテスト | DOM テスト |
| Playwright or Cypress | E2E テスト | 検討中 |

## テスト戦略（提案）

### レベル 1: API ルートテスト（最優先）

テスト対象（16 エンドポイント）:

**認証系:**
- `/api/signup` — 正常登録、バリデーションエラー、重複メール
- `/api/auth/[...nextauth]` — ログイン成功、失敗、セッション確認

**チャット系:**
- `/api/chat` — 正常レスポンス、レート制限、認証なし拒否
- `/api/generate-image` — 画像生成、レート制限、パラメータバリデーション
- `/api/upload-image` — アップロード成功、サイズ制限

**セッション系:**
- `/api/sessions` — GET 一覧、POST 作成
- `/api/sessions/[id]` — PATCH 更新、DELETE 削除、権限チェック
- `/api/sessions/[id]/messages` — GET/POST

**管理系:**
- `/api/admin/*` — admin ロール必須チェック、各 CRUD 操作

### レベル 2: フック・ユーティリティテスト

| 対象 | テスト内容 |
|------|-----------|
| `rate-limiter.ts` | 制限到達、ウィンドウリセット |
| `prompt-loader.ts` | キャッシュ動作、フォールバック |
| `api-logger.ts` | ログ記録 |
| `useChatSession.ts` | メッセージ追加、セッション作成（リファクタリング後） |
| `useOnlineStatus.ts` | オンライン/オフライン切替 |

### レベル 3: コンポーネントテスト

| コンポーネント | テスト内容 |
|-------------|-----------|
| ChatInput | 入力、送信（Enter）、改行（Shift+Enter） |
| ChatMessage | メッセージ表示、クイックリプライ |
| PreviewPanel | タブ切替、画像表示 |
| PlanLimitModal | 表示、閉じる、アップグレード導線 |
| Header | ナビゲーション、ログイン状態による表示切替 |

### レベル 4: E2E テスト（将来）

| フロー | ステップ |
|--------|---------|
| ユーザー登録 → ログイン | signup → login → dashboard リダイレクト |
| チャット → 画像生成 | login → chat → メッセージ送信 → 画像生成完了 |
| ダッシュボード操作 | login → dashboard → セッション閲覧 → 削除 |
| 管理画面 | admin login → stats → prompts 編集 |

## 品質基準

### ビルド

- `npm run build` が **エラーゼロ** で完了すること
- TypeScript の strict mode エラーなし
- ESLint 警告は許容、エラーは不可

### パフォーマンス目標

| 指標 | 目標値 |
|------|--------|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| ビルドサイズ | 監視（増加傾向を追跡） |

### セキュリティチェックリスト

- [ ] XSS: ユーザー入力のサニタイズ（dompurify 使用済み）
- [ ] CSRF: NextAuth のトークン検証
- [ ] SQL Injection: Supabase SDK 経由（パラメータ化クエリ）
- [ ] 認証バイパス: middleware + API 両方でチェック
- [ ] レート制限: chat(5/分), generate-image(50/日)
- [ ] 環境変数: `.env.local` が `.gitignore` に含まれていること

### アクセシビリティ

- コントラスト比 4.5:1 以上
- キーボードナビゲーション対応
- aria-label の適切な設定
- フォーカスインジケーター表示

## PR / コミット前チェックリスト

1. `npm run build` 成功
2. `npm run lint` エラーなし
3. 新規 API には認証チェックあり
4. ユーザー入力はサニタイズ済み
5. 環境変数はハードコードしていない
6. 大きなファイル（300行超）は分割を検討
7. デザイントークン使用（ハードコード色なし）

## 既知の課題

| 項目 | リスク | 対応 |
|------|--------|------|
| テストゼロ | HIGH | 次回セッションで API テストから着手 |
| RLS 未設定 | MEDIUM | NextAuth で対応中だが、DB レベルでの保護も検討 |
| インメモリレート制限 | LOW | 本番デプロイ間でリセット |
| プロンプトキャッシュ | LOW | 管理画面更新が即反映されない |
