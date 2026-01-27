---
name: merge
description: PRがGitHub上でマージされた後のローカルクリーンアップ専用。worktreeとブランチを削除する。ユーザーが「/merge」「マージしてください」「片付けて」と言った時に使用する。※開発完了時の選択肢（PR作成/ローカルマージ/保持/破棄）が必要な場合は finishing-a-development-branch を使用すること。
---

# Post-Merge Cleanup（マージ後クリーンアップ）

**目的**: PRがGitHub上でマージ**された後**に、ローカルのworktreeとブランチを削除する。

**注意**: このスキルはマージを実行するものではない。マージ後の片付け専用。

## 関連スキルとの使い分け

| 状況 | 使用するスキル |
|------|---------------|
| 開発完了、次に何をするか決めたい | `finishing-a-development-branch` |
| PRがGitHub上でマージ済み、片付けたい | `merge`（このスキル） |
| 複数の不要ブランチを一括削除したい | `prune` |

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
.claude/skills/merge/merge-cleanup.sh <PR番号>
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
# GitHub上でPRをマージ（--delete-branchは使用しない）
# worktreeが存在する場合、--delete-branchはローカルブランチ削除に失敗するため
gh pr merge <PR番号> --squash

# その後、クリーンアップスクリプトを再実行
.claude/skills/merge/merge-cleanup.sh <PR番号>
```

**注意**: `--delete-branch` オプションは使用しないこと。worktreeが存在する場合、ローカルブランチの削除に失敗する。ブランチの削除はクリーンアップスクリプトで行う。

## 安全対策

### 削除しない条件

以下の場合は削除を中止し、ユーザーに報告:

- 未コミットの変更がある
- PRがマージされていない
- `main` または `master` ブランチを削除しようとしている

## クイックリファレンス

| 操作 | コマンド |
|------|----------|
| クリーンアップ実行 | `.claude/skills/merge/merge-cleanup.sh <PR番号>` |
| PRマージ | `gh pr merge <PR番号> --squash` |
| PR状態確認 | `gh pr view <PR番号> --json state` |
