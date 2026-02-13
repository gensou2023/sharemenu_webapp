# Hotfix: ブランチ状態の修正 — 作業指示書

**作成日**: 2026-02-13
**対象**: エンジニアエージェント
**緊急度**: 高（Sprint B 作業再開のブロッカー）

---

## 背景

PM のオペレーションミスにより、`docs/sprint-b-instructions.md` が `develop` ではなく `main` に直接 commit されてしまった。その結果、エンジニアが `develop` から `feature/sprint-b` を作成した際にファイルが存在せず、セッションコンテキストの情報で作業を進めてしまった。

現在の状態を修正し、Sprint B の作業を正しく再開できる状態にする。

---

## 現在の状態

### ブランチ状況

```
main:     sprint-b-instructions.md + feature-spec-v2.md + implementation-plan-v2.md がある（developより3ファイル先行）
develop:  Sprint A完了時点。上記3ファイルなし
feature/sprint-b: developから分岐。未commitの変更6ファイルあり
```

### feature/sprint-b の未commit変更（6ファイル）

| ファイル | 変更内容 |
|---------|---------|
| `CLAUDE.md` | 1行追加 |
| `src/lib/greeting.ts` | 夜間挨拶変更 + Free上限メッセージ追加 |
| `src/__tests__/lib/greeting.test.ts` | テスト更新 |
| `src/hooks/useDashboardData.ts` | userRole state 追加 |
| `src/components/dashboard/DashboardHeader.tsx` | Props追加、fadeInUp、Freeプラン判定 |
| `src/app/dashboard/page.tsx` | userRoleをDashboardHeaderに渡す変更 |

### main にのみ存在するファイル（developにない）

| ファイル | 備考 |
|---------|------|
| `docs/sprint-b-instructions.md` | PMが誤ってmainにcommit |
| `docs/feature-spec-v2.md` | 別セッションでmainにcommitされた模様 |
| `docs/implementation-plan-v2.md` | 同上 |

---

## 修正手順

### Step 1: feature/sprint-b の未commit変更を退避

```bash
git checkout feature/sprint-b
git stash save "Sprint B Task 1 途中作業（レビュー前）"
```

### Step 2: main の docs 3ファイルを develop に取り込む

```bash
git checkout develop

# main から3ファイルだけ cherry-pick（commitごと取り込む場合）
# または、ファイル単位で取り込む:
git checkout main -- docs/sprint-b-instructions.md
git checkout main -- docs/feature-spec-v2.md
git checkout main -- docs/implementation-plan-v2.md

git commit -m "docs: main から docs 3ファイルを develop に取り込み

- sprint-b-instructions.md (Sprint B 業務指示書)
- feature-spec-v2.md
- implementation-plan-v2.md

PMのcommit先ミスによりmainに入っていたファイルの修正"
```

### Step 3: develop を push

```bash
git push origin develop
```

### Step 4: main を develop と同期

main が develop より先行している状態を解消する。main は develop の fast-forward マージで管理するブランチなので、develop に取り込んだ後は同期させる。

```bash
git checkout main
git merge develop --ff-only
git push origin main
```

`--ff-only` が失敗する場合（mainにdevelop以外のcommitがある場合）は、無理にmergeせず以下を報告:
- main と develop の差分（`git log develop..main --oneline`）
- どのcommitが問題か

### Step 5: feature/sprint-b を develop の最新に rebase

```bash
git checkout feature/sprint-b
git rebase develop
```

### Step 6: 退避した変更の扱いを判断

```bash
git stash list
# "Sprint B Task 1 途中作業（レビュー前）" が表示される

git stash show -p
# 変更内容を確認
```

**判断基準:**
- 変更内容が sprint-b-instructions.md の Task 1（ウェルカムエリア刷新）に沿っており、品質に問題がなければ → `git stash pop` で復帰して作業継続
- 内容に問題がある、または最初からやり直したい場合 → `git stash drop` で破棄

### Step 7: 状態確認

以下をすべて確認:

```bash
# develop に sprint-b-instructions.md が存在する
git show develop:docs/sprint-b-instructions.md | head -5

# main と develop が同期している（差分なし）
git log develop..main --oneline  # 空であること
git log main..develop --oneline  # 空であること

# feature/sprint-b が develop から正しく分岐している
git log --oneline develop..feature/sprint-b

# ビルド確認
npm run build
npm test
```

---

## 完了基準

- [ ] `docs/sprint-b-instructions.md` が develop に存在する
- [ ] `docs/feature-spec-v2.md` と `docs/implementation-plan-v2.md` が develop に存在する
- [ ] main と develop が同期している（差分なし）
- [ ] feature/sprint-b が develop の最新から分岐している
- [ ] 退避した変更の扱い（復帰 or 破棄）が完了している
- [ ] `npm run build` と `npm test` がパスする

---

## 完了後

ブランチ修正が完了したら、`docs/sprint-b-instructions.md` を改めて読み、Sprint B の作業を Task 1 から再開（または退避した変更を復帰して Task 2 から継続）してください。
