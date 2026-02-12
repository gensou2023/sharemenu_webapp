---
name: plan-issues
description: 企画・分析結果からGitHub Issueを構造化して一括作成する
argument-hint: [機能名や企画の説明]
disable-model-invocation: true
allowed-tools: Bash, Read, Grep, Glob, Task, WebFetch
---

# /plan-issues — 企画からGitHub Issue一括作成

以下の手順で、企画・分析結果を構造化されたGitHub Issueに変換してください。

## 入力

ユーザーから提供される情報（以下のいずれか）:
- 機能の企画説明テキスト
- 参考UIのスクリーンショット
- 要件ドキュメントのパス
- 会話コンテキストでの分析結果

引数: $ARGUMENTS

## 処理手順

### Step 1: 現状把握
1. `gh issue list --state open` で既存のオープンIssueを確認
2. `gh api repos/{owner}/{repo}/milestones` で既存Milestoneを確認
3. `gh label list` で既存Labelを確認
4. CLAUDE.md を読んでプロジェクトの現状を把握

### Step 2: 要件分析
1. 提供された企画情報を分析
2. 現在のコードベースを探索し、影響範囲を特定
3. 機能を独立したIssue単位に分割（1 Issue = 1つの実装可能な単位）
4. Issue間の依存関係を整理

### Step 3: Issue設計
各Issueに以下の構造を含める:

```markdown
## 概要
[1-2文で何をするか]

## 背景
[なぜこの変更が必要か]

## 要件
[具体的な実装要件をリスト形式で]

### DB変更（該当する場合）
[SQLマイグレーション案]

### API変更（該当する場合）
[エンドポイント・リクエスト・レスポンス]

### UI変更（該当する場合）
[コンポーネント構成・デザイン仕様]

## 受入基準
- [ ] [テスト可能な条件1]
- [ ] [テスト可能な条件2]
- [ ] `npm run build` 成功
```

### Step 4: 作成実行
1. 必要ならMilestoneを作成（`gh api repos/{owner}/{repo}/milestones -f title="..." -f description="..."`)
2. 必要ならLabelを作成（`gh label create "name" --description "..." --color "HEX"`）
3. Issueを依存順に作成（`gh issue create --title "..." --milestone "..." --label "..." --body "..."`)
4. 作成したIssue一覧を表形式で出力

## 出力フォーマット

最後に以下のサマリーを表示:

```
| # | Issue | 依存 | 工数目安 |
|---|-------|------|---------|
| #XX | タイトル | なし / #YY | S/M/L |
```

推奨実装順序も提示すること。
