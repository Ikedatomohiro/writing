---
name: merge
description: 現在のブランチをmainにマージし、worktreeとブランチを削除する。PRがマージされた後のクリーンアップに使用する。ユーザーが「/merge」「マージして削除」「完了したので片付けて」と言った時に使用する。
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

### 3. メインリポジトリに移動

worktree内にいる場合、メインリポジトリに移動する:

```bash
# メインリポジトリのパスを取得
MAIN_REPO=$(git rev-parse --path-format=absolute --git-common-dir | sed 's|/.git$||')

# メインリポジトリに移動
cd "$MAIN_REPO"
```

### 4. mainブランチを更新

```bash
git checkout main
git pull origin main
```

### 5. ローカルマージの確認（PRがまだマージされていない場合）

PRがまだマージされていない場合、ユーザーに確認:

1. **GitHubでPRをマージする** - 推奨
2. **ローカルでマージする** - 以下のコマンドを実行

```bash
# ローカルでマージする場合
git merge <ブランチ名>
git push origin main
```

### 6. worktreeを削除

```bash
# worktreeを削除
git worktree remove .worktrees/<名前>

# orphaned参照をクリーンアップ
git worktree prune
```

### 7. ローカルブランチを削除

```bash
# マージ済みブランチを安全に削除
git branch -d <ブランチ名>
```

**削除できない場合**:
- `git branch -d` が失敗した場合、ブランチがマージされていない可能性がある
- 強制削除 `git branch -D` は、ユーザーの明示的な確認後のみ実行

### 8. リモートブランチを削除（オプション）

PRがマージされた後、リモートブランチを削除:

```bash
# リモートブランチを削除
git push origin --delete <ブランチ名>
```

**注意**: GitHubの設定でマージ時に自動削除される場合がある。その場合はスキップ。

### 9. 結果報告

```markdown
## Merge and Cleanup 完了

| 項目 | 状態 |
|------|------|
| ブランチ | `<ブランチ名>` |
| PRマージ | 完了 |
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
| メインリポジトリパス | `git rev-parse --path-format=absolute --git-common-dir` |
| worktree削除 | `git worktree remove .worktrees/<名前>` |
| ブランチ削除（安全） | `git branch -d <ブランチ>` |
| リモートブランチ削除 | `git push origin --delete <ブランチ>` |
| orphan削除 | `git worktree prune` |
