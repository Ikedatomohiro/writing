---
name: merge
description: 現在のブランチをmainにマージし、worktreeとブランチを削除する。PRがマージされた後のクリーンアップに使用する。ユーザーが「/merge」「マージしてください」「マージして」「マージして削除」「完了したので片付けて」と言った時に使用する。
---

# Merge and Cleanup

作業が完了したブランチをmainにマージし、worktreeとブランチを削除する。

## 前提条件

- PRがGitHub上でmainにマージ済みであること
- または、ローカルでマージする場合は変更がすべてコミット済みであること

## 実行手順

### 1. 現在の状態を確認

```bash
# 現在のブランチを確認
git branch --show-current

# 現在のディレクトリを確認（worktree内かどうか）
pwd

# worktree一覧を確認
git worktree list

# 未コミットの変更がないか確認
git status --porcelain
```

**未コミットの変更がある場合**:
- 変更をコミットするか、破棄するかユーザーに確認する
- 変更がある状態で続行しない

### 2. マージ状態を確認

```bash
# リモートの最新状態を取得
git fetch origin

# PRがマージ済みか確認（GitHub CLIを使用）
gh pr list --state merged --head <ブランチ名>

# または、mainブランチにマージされているか確認
git branch -r --contains HEAD | grep "origin/main"
```

**結果の判定**:
- `gh pr list` の出力が空の場合: PRがマージされていない
- `gh pr list` の出力にPR情報が表示された場合: PRがマージ済み
- `git branch -r --contains HEAD` で `origin/main` が表示された場合: マージ済み

### 3. 関連Issueの検出とクローズ

PRのdescriptionから関連issueを検出し、`Ikedatomohiro/writing-task`リポジトリのissueをクローズする。

```bash
# PRの情報を取得（descriptionを含む）
gh pr view <ブランチ名> --json body,number

# PRのdescriptionからissue番号を抽出
# 対象キーワード: Close/Closed/Closes, Fix/Fixed/Fixes, Resolve/Resolved/Resolves
# 例: "Closes #123", "Fixed #45", "Resolves #789"
```

**issue番号の抽出パターン**（GitHub標準キーワード対応）:
- `[Cc]lose[sd]?\s*#(\d+)` （Close, Closed, Closes）
- `[Ff]ix(e[sd])?\s*#(\d+)` （Fix, Fixed, Fixes）
- `[Rr]esolve[sd]?\s*#(\d+)` （Resolve, Resolved, Resolves）

**具体的な抽出コマンド例**:

```bash
# PRのbodyを取得してissue番号を抽出
BODY=$(gh pr view <ブランチ名> --json body -q '.body')
ISSUE_NUMBERS=$(echo "$BODY" | grep -oEi '(close[sd]?|fix(e[sd])?|resolve[sd]?)\s*#[0-9]+' | grep -oE '[0-9]+')

# 抽出結果を確認
echo "$ISSUE_NUMBERS"
```

**issueをクローズ**:

```bash
# 検出したissue番号をwriting-taskリポジトリでクローズ
gh issue close <issue番号> --repo Ikedatomohiro/writing-task

# 例: Issue #5 をクローズ
gh issue close 5 --repo Ikedatomohiro/writing-task
```

**注意事項**:
- 複数のissue番号が検出された場合、すべてをクローズする
- issueが既にクローズされている場合はスキップ（エラーにならない）
- issueが存在しない場合はエラーメッセージを表示し、続行する

**エラー時の挙動例**:

```bash
# Issue番号が検出されなかった場合
$ echo "$ISSUE_NUMBERS"
（空出力）
→ 「関連Issueは検出されませんでした」と報告し、次のステップへ進む

# Issueが既にクローズされている場合
$ gh issue close 5 --repo Ikedatomohiro/writing-task
Issue #5 is already closed
→ 警告を表示し、続行する

# Issueが存在しない場合
$ gh issue close 999 --repo Ikedatomohiro/writing-task
GraphQL: Could not resolve to an issue or pull request with the number of 999.
→ エラーを表示し、続行する（他のissueがあれば処理を継続）
```

### 4. メインリポジトリに移動

worktree内にいる場合、メインリポジトリに移動する:

```bash
# メインリポジトリのパスを取得
MAIN_REPO=$(git rev-parse --path-format=absolute --git-common-dir | sed 's|/.git$||')

# メインリポジトリに移動
cd "$MAIN_REPO"
```

### 5. mainブランチを更新

```bash
git checkout main
git pull origin main
```

### 6. ローカルマージの確認（PRがまだマージされていない場合）

PRがまだマージされていない場合、ユーザーに確認:

1. **GitHubでPRをマージする** - 推奨
2. **ローカルでマージする** - 以下のコマンドを実行

```bash
# ローカルでマージする場合
git merge <ブランチ名>
git push origin main
```

### 7. worktreeを削除

```bash
# worktreeを削除
git worktree remove .worktrees/<名前>

# orphaned参照をクリーンアップ
git worktree prune
```

### 8. ローカルブランチを削除

```bash
# マージ済みブランチを安全に削除
git branch -d <ブランチ名>
```

**削除できない場合**:
- `git branch -d` が失敗した場合、ブランチがマージされていない可能性がある
- 強制削除 `git branch -D` は、ユーザーの明示的な確認後のみ実行

### 9. リモートブランチを削除（オプション）

PRがマージされた後、リモートブランチを削除:

```bash
# リモートブランチを削除
git push origin --delete <ブランチ名>
```

**注意**: GitHubの設定でマージ時に自動削除される場合がある。その場合はスキップ。

### 10. 結果報告

```markdown
## Merge and Cleanup 完了

| 項目 | 状態 |
|------|------|
| ブランチ | `<ブランチ名>` |
| PRマージ | 完了 |
| 関連Issue | #<番号> クローズ済み / なし |
| worktree削除 | `.worktrees/<名前>` 削除済み |
| ローカルブランチ | 削除済み |
| リモートブランチ | 削除済み / 既に削除済み |

現在のブランチ: `main`
```

## 安全対策

### 削除前の確認

以下の状態を必ず確認してから削除を実行:

- [ ] 未コミットの変更がないこと
- [ ] PRがマージ済み、またはローカルマージが完了していること
- [ ] 重要な変更が失われないこと

### 削除しない条件

以下の場合は削除を中止し、ユーザーに報告:

- 未コミットの変更がある
- PRがマージされておらず、ユーザーがローカルマージも希望しない
- `main` または `master` ブランチを削除しようとしている

## クイックリファレンス

| 操作 | コマンド |
|------|----------|
| PRマージ確認 | `gh pr list --state merged --head <ブランチ>` |
| PR詳細取得 | `gh pr view <ブランチ> --json body,number` |
| Issueクローズ | `gh issue close <番号> --repo Ikedatomohiro/writing-task` |
| メインリポジトリパス | `git rev-parse --path-format=absolute --git-common-dir` |
| worktree削除 | `git worktree remove .worktrees/<名前>` |
| ブランチ削除（安全） | `git branch -d <ブランチ>` |
| リモートブランチ削除 | `git push origin --delete <ブランチ>` |
| orphan削除 | `git worktree prune` |
