---
name: priority-review
description: 全オープンIssue・技術的負債・コードベース状態を分析し、優先度を再整理してスプリント計画を出力する
disable-model-invocation: true
allowed-tools: Bash, Read, Grep, Glob, Task
---

# /priority-review — 開発優先度の全体レビュー

プロジェクト全体の開発優先度を見直し、スプリント計画を再構築してください。

## 処理手順

### Step 1: 情報収集（並列実行）

以下を並列で収集:

1. **オープンIssue**: `gh issue list --state open --json number,title,milestone,labels,createdAt`
2. **クローズ済みIssue（直近）**: `gh issue list --state closed --limit 10 --json number,title,closedAt`
3. **Milestone一覧**: `gh api repos/{owner}/{repo}/milestones`
4. **CLAUDE.md**: 技術的負債セクション・次回タスクセクションを確認
5. **コードベース統計**:
   - ページ数: `src/app/` 配下のpage.tsxをカウント
   - API数: `src/app/api/` 配下のroute.tsをカウント
   - コンポーネント数: `src/components/` 配下の.tsxをカウント
   - テスト数: `src/__tests__/` 配下の.test.tsをカウント
   - テストカバレッジ: `npm test` を実行して結果を確認

### Step 2: 現状サマリー

以下の表を出力:

```
## プロダクト現状

| カテゴリ | 数値 |
|---------|------|
| ページ数 | XX |
| APIエンドポイント | XX |
| コンポーネント | XX |
| テストファイル | XX |
| テスト数 | XX |
| オープンIssue | XX |
| 直近クローズIssue（2週間） | XX |
```

### Step 3: 4軸評価

各オープンIssueと未起票の技術的負債を、以下の4軸で評価:

| 軸 | 説明 | 重み |
|----|------|------|
| **ユーザー価値** | ユーザーが直接恩恵を感じるか | 高 |
| **収益貢献** | Pro/有料プランの訴求力になるか | 中 |
| **技術リスク** | 放置するとどれだけ危険か | 高 |
| **実装コスト** | S(半日) / M(1日) / L(2-3日) / XL(1週間+) | - |

### Step 4: Tier分け

5段階に分類:

- **Tier 1**: 今すぐやるべき（基盤 + 高インパクト）
- **Tier 2**: 次にやる（ユーザー体験の底上げ）
- **Tier 3**: その次（差別化・エンゲージメント）
- **Tier 4**: 余裕があれば（あると嬉しい）
- **Tier 5**: 後回し可（現時点では優先度低）

各Tierに分類理由を明記すること。

### Step 5: スプリント計画

```
Sprint N (テーマ名)
├─ #XX Issue名 (工数)
├─ #YY Issue名 (工数)
└─ 見積: X日〜X日

Sprint N+1 ...
```

### Step 6: 特記事項

- 順序を変えるべき判断ポイント（例: ダークモードを先にやると後続が楽）
- ブロッカーや外部依存
- 次回レビュー推奨タイミング

## 出力

上記のStep 2〜6をまとめて出力。ユーザーに方向性の修正を確認する形で終了。
