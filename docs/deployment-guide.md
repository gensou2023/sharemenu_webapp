# MenuCraft AI デプロイガイド

## 環境情報

| 項目 | 値 |
|------|-----|
| フレームワーク | Next.js 15（※16は未対応のため使わない） |
| ホスティング | Vercel（Hobby プラン） |
| リポジトリ | https://github.com/gensou2023/sharemenu_webapp |
| 本番URL | https://sharemenu-webapp.vercel.app |
| AI API | Google Gemini 2.0 Flash |
| 認証 | NextAuth.js v5（Credentials） |

---

## Vercel 環境変数（必須）

Vercel ダッシュボード > Settings > Environment Variables に以下を設定：

| Key | 説明 | 設定場所 |
|-----|------|----------|
| `AUTH_SECRET` | NextAuth の暗号化キー | `npx auth secret` で生成 |
| `GEMINI_API_KEY` | Google AI Studio の API キー | https://aistudio.google.com/ |

**注意：** 環境変数を変更したら必ず **Redeploy** が必要です。

---

## デプロイ手順

### 通常のデプロイ（コード変更時）
1. ローカルでコード変更
2. `npm run build` でビルド確認
3. `git add` → `git commit` → `git push origin main`
4. Vercel が自動でデプロイ（1〜2分）

### 環境変数の変更時
1. Vercel > Settings > Environment Variables で値を変更
2. Deployments > 最新の「...」> **Redeploy**
3. 「Use existing Build Cache」のチェックを **外す**
4. Redeploy をクリック

---

## トラブルシューティング

### よくあるエラーと対処法

#### 1. Vercel で push しても新しいコードが反映されない
- **原因：** GitHub アカウントが Vercel チームに紐づいていない
- **確認：** Vercel からのメール「Failed deployment」を確認
- **対処：** リポジトリを public にするか、Vercel の Authentication Settings で GitHub アカウントを接続

#### 2. API ルート（/api/chat）が 404 になる
- **原因：** Next.js のバージョン互換性の問題
- **確認：** `package.json` の `next` のバージョンを確認
- **対処：** Next.js 15 系を使用する（16 は Vercel で未対応の場合あり）

#### 3. ESLint エラーでビルドが失敗
- **原因：** `eslint.config.mjs` の形式が Next.js バージョンと不一致
- **確認：** Vercel の Build Logs でエラー内容を確認
- **対処：** `eslint-config-next` のバージョンを Next.js と揃える

#### 4. Gemini API が「First content should be with role 'user'」エラー
- **原因：** チャット履歴の最初が AI メッセージ（ウェルカムメッセージ）になっている
- **対処：** API に送信する履歴から最初の AI メッセージを除外する

#### 5. Gemini API が「Invalid value at 'system_instruction'」エラー
- **原因：** `systemInstruction` を文字列で渡している
- **対処：** `{ role: "user", parts: [{ text: "..." }] }` 形式で渡す

#### 6. Gemini API が 429 Too Many Requests
- **原因：** 無料プランのレート制限に達した
- **対処：** 1〜2分待ってリトライ、または Google AI Studio で有料プランにアップグレード

---

## 開発環境セットアップ

```bash
# 依存関係インストール
npm install

# .env.local を作成（初回のみ）
# AUTH_SECRET と GEMINI_API_KEY を設定

# 開発サーバー起動
npm run dev -- -p 3456

# ビルド確認
npm run build
```

---

## 重要な注意事項

- `.env.local` は `.gitignore` に含まれているため GitHub にはプッシュされない
- API キーは定期的にローテーション（再生成）することを推奨
- `robots.txt` で検索エンジンのインデックスを無効化済み
- デモアカウント: `demo@menucraft.jp` / `demo1234`
