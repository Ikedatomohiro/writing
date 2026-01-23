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

### 1. 未コミットの変更を確認

```bash
git status --porcelain
```

**未コミットの変更がある場合**:
- 変更をコミットするか、破棄するかユーザーに確認する
- 変更がある状態で続行しない

### 2. PR番号を特定

```bash
# 現在のブランチ名からPRを検索
BRANCH=$(git branch --show-current)
gh pr list --head "$BRANCH" --state all --json number,state --jq '.[0]'
```

### 3. クリーンアップスクリプトを実行

```bash
./scripts/merge-cleanup.sh <PR番号>
```

スクリプトが自動的に以下を実行:
- PRのマージ状態を確認
- 関連Issueをクローズ（writing-taskリポジトリ）
- メインリポジトリに移動（worktree内の場合）
- mainブランチを更新
- worktreeを削除
- ローカルブランチを削除

### 4. PRがまだマージされていない場合

スクリプトがエラーを返した場合、先にPRをマージする:

```bash
# GitHub上でPRをマージ（推奨）
gh pr merge <PR番号> --merge --delete-branch

# その後、クリーンアップスクリプトを再実行
./scripts/merge-cleanup.sh <PR番号>
```

## 安全対策

### 削除しない条件

以下の場合は削除を中止し、ユーザーに報告:

- 未コミットの変更がある
- PRがマージされていない
- `main` または `master` ブランチを削除しようとしている

## クイックリファレンス

| 操作 | コマンド |
|------|----------|
| クリーンアップ実行 | `./scripts/merge-cleanup.sh <PR番号>` |
| PRマージ | `gh pr merge <PR番号> --merge --delete-branch` |
| PR状態確認 | `gh pr view <PR番号> --json state` |
