# CodeRabbit AI コードレビュー 導入ガイド

**作成日**: 2026-03-04
**対象プロジェクト**: MenuCraft AI（sharemenu_webapp）
**GitHub Issue**: #64

---

## 1. 概要

### CodeRabbit とは

CodeRabbit は AI によるコードレビュー自動化ツール。
PR 作成時の自動レビュー（GitHub連携）に加え、CLI版ではローカルでコミット前にレビューを実行できる。

### 導入の目的

- Claude Code での AI 生成コードの品質チェック自動化
- セキュリティ・パフォーマンス・ベストプラクティスの見落とし防止
- **ローカルレビュー + Claude Code の自動修正ループ** で PR 前に品質を担保

### 想定ワークフロー

```
Claude Code で実装
    |
    v
coderabbit review --plain（ローカルレビュー）
    |
    v
指摘事項を Claude Code が自動修正
    |
    v
再レビュー -> 問題なし -> コミット & PR
    |
    v
PR で CodeRabbit が再度レビュー（GitHub連携）
```

---

## 2. セットアップ手順

### 2-1. CodeRabbit CLI インストール

```bash
curl -fsSL https://cli.coderabbit.ai/install.sh | sh
```

インストール先: `~/.local/bin/coderabbit`

インストール後にシェルを再読込:

```bash
source ~/.zshrc
```

バージョン確認:

```bash
coderabbit --version
# 0.3.7
```

### 2-2. 認証（OAuth）

```bash
coderabbit auth login
```

1. ブラウザが自動で開く（開かない場合は表示された URL を手動で開く）
2. GitHub アカウントでログイン
3. 表示されるトークン（Base64文字列）をターミナルに貼り付けて Enter

認証状態の確認:

```bash
coderabbit auth status
# Authenticated as: gensou2023
```

**注意**: この認証は対話的なターミナル操作が必要。
パイプ入力やスクリプトからの自動化はできない（OAuth state の一致が必要なため）。

### 2-3. プロジェクト設定ファイル

リポジトリルートに `.coderabbit.yaml` を配置:

```yaml
language: ja

reviews:
  auto_review:
    enabled: true
    drafts: false
  path_filters:
    - "src/**"
    - "!docs/**"
    - "!supabase/**"
    - "!**/__tests__/**/*.snap"
  path_instructions:
    - path: "src/app/api/**"
      instructions: |
        セキュリティを重点的にレビュー:
        - 認証チェック（auth()の呼び出し有無）
        - 入力バリデーション
        - SQLインジェクション防止
        - レート制限の適用
    - path: "src/components/**"
      instructions: |
        UIコンポーネントのレビュー:
        - アクセシビリティ（aria属性、キーボード操作）
        - 不要な再レンダリングの防止
        - デザイントークンの使用（ハードコード色の検出）
    - path: "src/hooks/**"
      instructions: |
        React Hooksのレビュー:
        - Hooksルール違反がないか
        - 依存配列の正確性
        - メモリリーク（useEffect cleanupの有無）
    - path: "src/lib/**"
      instructions: |
        共通ライブラリのレビュー:
        - 型安全性
        - エラーハンドリング
        - 外部入力のバリデーション
```

### 2-4. Claude Code プラグイン（任意）

Claude Code にプラグインをインストールすると、スラッシュコマンドで直接レビューを呼び出せる:

```
/plugin install coderabbit
```

利用可能なコマンド:

| コマンド | 説明 |
|---------|------|
| `/coderabbit:review` | 全変更をレビュー |
| `/coderabbit:review committed` | コミット済み変更のみ |
| `/coderabbit:review uncommitted` | 未コミット変更のみ |
| `/coderabbit:review --base main` | 指定ブランチとの差分 |

---

## 3. 使い方

### 3-1. CLI で直接レビュー

```bash
# リポジトリルートで実行
cd menucraft-web

# 全変更をレビュー（詳細出力）
coderabbit review --plain

# トークン効率重視（Claude Code 連携向け）
coderabbit review --prompt-only

# コミット済みの変更のみ
coderabbit review --committed

# develop ブランチとの差分
coderabbit review --base develop
```

### 3-2. Claude Code との連携ワークフロー

Claude Code に以下のような指示を出す:

```
この機能を実装したら、coderabbit review --plain でレビューして、
指摘があれば修正してください。
```

Claude Code が自動的に:
1. 機能を実装
2. `coderabbit review --plain` を実行
3. 指摘事項を解析
4. 修正を適用
5. 必要に応じて再レビュー

### 3-3. PR レビュー（GitHub連携）

CodeRabbit の GitHub App を有効にしている場合、PR を作成すると自動でレビューコメントが付く。
ローカルレビューと二段構えでの品質担保が可能。

---

## 4. トラブルシューティング

| 問題 | 対処法 |
|------|--------|
| `command not found: coderabbit` | `source ~/.zshrc` でPATH再読込 |
| 認証エラー | `coderabbit auth logout` → `coderabbit auth login` で再認証 |
| レビュー対象なし | `git status` で変更があるか確認。`--base` でブランチ指定 |
| レビューが遅い | 変更を小さく分割、または `--prompt-only` で出力を簡略化 |

---

## 5. 参考リンク

- [CodeRabbit 公式](https://www.coderabbit.ai/)
- [CodeRabbit CLI](https://www.coderabbit.ai/cli)
- [CLI + Claude Code 連携ガイド](https://docs.coderabbit.ai/cli/claude-code-integration)
- [Claude Plugin (GitHub)](https://github.com/coderabbitai/claude-plugin)
- [CodeRabbit CLI ブログ（日本語）](https://www.coderabbit.ai/blog/coderabbit-cli-free-ai-code-reviews-in-your-cli-ja)

---

## 6. 導入時の気づき・注意点

### OAuth認証はターミナル直接操作が必須

`coderabbit auth login` は対話型の OAuth フロー。
CI/CD やスクリプトからの自動化はできない（state パラメータの一致が必要）。
Claude Code のBashツールからのパイプ入力でも認証不可だった。

→ 初回認証のみ手動で行い、以降は `~/.coderabbit/` に保存されたトークンで動作する。

### Free Plan の範囲

- OSS / 個人リポジトリは無料で利用可能
- ローカル CLI レビューは無制限
- GitHub PR レビューも基本機能は無料

### .coderabbit.yaml の path_instructions

パス別にレビュー観点を指定できるのが強力。
プロジェクト固有のルール（デザイントークン使用ルール、認証パターンなど）を指示に含めると精度が上がる。
