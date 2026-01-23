---
name: prune
description: 不要なブランチとworktreeを削除してリポジトリを整理する。マージ済みブランチの検出、worktreeの削除、リモート参照の更新を行う。ユーザーが「/prune」「ブランチを掃除して」「不要なブランチを削除」と言った時に使用する。
---

# Cleanup Branches and Worktrees

不要なブランチとworktreeを安全に削除してリポジトリを整理する。

## 実行手順

### 1. 現在の状態を確認

まず以下のコマンドで状態を把握する:

```bash
# 現在のブランチを確認
git branch --show-current

# ローカルブランチ一覧
git branch

# worktree一覧
git worktree list

# リモートブランチ一覧
git branch -r
```

### 2. mainブランチに移動

削除作業はmainブランチから行う:

```bash
git checkout main
git pull origin main
```

**注意**: 現在worktree内にいる場合は、まずメインリポジトリに移動する。

### 3. リモート追跡参照を更新

削除済みのリモートブランチの参照をクリーンアップ:

```bash
git fetch --prune
```

### 4. マージ済みブランチを検出

mainにマージ済みのローカルブランチを一覧表示:

```bash
git branch --merged main | grep -v "^\*\|main"
```

### 5. worktreeを確認

各worktreeの状態を確認:

```bash
git worktree list
```

worktree内に未コミットの変更がないか確認:

```bash
# 各worktreeで実行
git -C <worktree-path> status --porcelain
```

### 6. 削除候補をユーザーに提示

以下の形式で削除候補を報告:

```markdown
## 削除候補

### マージ済みローカルブランチ
| ブランチ名 | 最終コミット日 |
|-----------|--------------|
| feature/xxx | 2024-01-20 |

### Worktrees
| パス | ブランチ | 未コミット変更 |
|-----|---------|--------------|
| .worktrees/xxx | feature/xxx | なし |

### 削除済みリモートブランチ（参照のみ残存）
| ブランチ名 |
|-----------|
| origin/feature/yyy |
```

### 7. ユーザー確認後に削除を実行

**必ずユーザーの確認を得てから削除する。**

#### worktreeの削除

```bash
# worktreeを削除（ブランチは残る）
git worktree remove .worktrees/<名前>

# worktreeとブランチを両方削除する場合
git worktree remove .worktrees/<名前>
git branch -d <ブランチ名>
```

#### ローカルブランチの削除

```bash
# マージ済みブランチを削除
git branch -d <ブランチ名>

# 強制削除（未マージでも削除）- 要ユーザー確認
git branch -D <ブランチ名>
```

#### リモートブランチの削除

```bash
# リモートブランチを削除
git push origin --delete <ブランチ名>
```

### 8. orphaned worktreeのクリーンアップ

直接削除されたworktreeの参照をクリーンアップ:

```bash
git worktree prune
```

### 9. 結果報告

削除完了後、以下を報告:

```markdown
## クリーンアップ完了

### 削除したworktrees
- .worktrees/xxx

### 削除したローカルブランチ
- feature/xxx
- fix/yyy

### 削除したリモートブランチ
- origin/feature/xxx

### 現在の状態
| 項目 | 数 |
|-----|---|
| ローカルブランチ | N |
| worktrees | N |
| リモートブランチ | N |
```

## 安全対策

### 削除しないブランチ

以下のブランチは削除対象から除外:

- `main`
- `master`
- 現在チェックアウト中のブランチ
- worktreeで使用中のブランチ（worktree削除前）

### 未コミット変更の確認

worktree削除前に必ず未コミット変更を確認。変更がある場合は警告し、ユーザーに対応を確認:

1. 変更をコミットする
2. 変更を破棄する
3. 削除をスキップする

### 強制削除の確認

`git branch -D` を使用する場合は、未マージの変更が失われることをユーザーに警告する。

## クイックリファレンス

| 操作 | コマンド |
|------|----------|
| マージ済みブランチ一覧 | `git branch --merged main` |
| ブランチ削除（安全） | `git branch -d <ブランチ>` |
| ブランチ削除（強制） | `git branch -D <ブランチ>` |
| worktree削除 | `git worktree remove <パス>` |
| worktreeクリーンアップ | `git worktree prune` |
| リモート参照更新 | `git fetch --prune` |
| リモートブランチ削除 | `git push origin --delete <ブランチ>` |
