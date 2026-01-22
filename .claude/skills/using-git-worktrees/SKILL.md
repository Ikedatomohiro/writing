---
name: using-git-worktrees
description: 機能開発時に隔離されたワークスペースを作成する。ディレクトリ選択とセーフティ検証を自動化。新機能実装やブランチ作業を開始する際に使用する。ユーザーが「/worktree」「worktreeを作成して」「隔離環境で作業したい」と言った時に使用する。
---

# Using Git Worktrees

機能開発のための隔離されたワークスペースを安全に作成する。

## 概要

git worktreeを使用することで、現在の作業を中断せずに別ブランチで作業できる。このスキルでは以下を自動化する:

- ディレクトリ配置の決定
- セーフティ検証
- 依存関係のインストール
- ベースラインテストの実行

## ディレクトリ選択

### 配置場所

プロジェクトローカルの `.worktrees/` ディレクトリに作成する。

```
/Users/tomo/Desktop/workspace/writing/
├── .worktrees/           # worktree配置ディレクトリ
│   ├── feature-auth/     # 認証機能開発用
│   └── fix-bug-123/      # バグ修正用
├── app/
├── tools/
└── ...
```

### 命名規則

```
.worktrees/<ブランチ種別>-<簡潔な説明>
```

例:
- `.worktrees/feature-user-profile`
- `.worktrees/fix-login-error`
- `.worktrees/refactor-api-layer`

## セーフティ検証

worktree作成前に以下を確認:

### 1. 現在のリポジトリ状態

```bash
# 未コミットの変更がないか確認
git status --porcelain
```

未コミットの変更がある場合は警告し、続行するか確認する。

### 2. 既存のworktree確認

```bash
# 既存のworktree一覧
git worktree list
```

同名のworktreeが存在する場合はエラー。

### 3. orphaned worktreeの検出

```bash
# 不要なworktree参照をクリーンアップ
git worktree prune --dry-run
```

orphaned worktreeがあれば `git worktree prune` を実行。

## 作成手順

### 1. プロジェクト名の検出

```bash
# リポジトリルートを取得
git rev-parse --show-toplevel
```

### 2. worktree作成

**新しいブランチを作成する場合:**
```bash
git worktree add .worktrees/<名前> -b <ブランチ名>
```

**既存のブランチを使用する場合:**
```bash
git worktree add .worktrees/<名前> <ブランチ名>
```

### 3. 環境変数のコピー

`.env`ファイルは`.gitignore`に含まれているため、worktreeには自動でコピーされない。メインリポジトリからコピーする:

```bash
# メインリポジトリのルートパスを取得
MAIN_REPO=$(git -C .worktrees/<名前> rev-parse --path-format=absolute --git-common-dir | sed 's|/.git$||')

# .envファイルをコピー
if [ -f "$MAIN_REPO/.env" ]; then
    cp "$MAIN_REPO/.env" .worktrees/<名前>/.env
fi

# .env.localファイルをコピー（存在する場合）
if [ -f "$MAIN_REPO/.env.local" ]; then
    cp "$MAIN_REPO/.env.local" .worktrees/<名前>/.env.local
fi

# tools/.envファイルをコピー（存在する場合）
if [ -f "$MAIN_REPO/tools/.env" ]; then
    cp "$MAIN_REPO/tools/.env" .worktrees/<名前>/tools/.env
fi
```

**注意**: 環境変数ファイルが見つからない場合は、ユーザーに確認する。

### 4. 依存関係のインストール

worktree内で依存関係を自動検出してインストール:

| ファイル | コマンド |
|---------|----------|
| `package.json` | `npm install` |
| `pyproject.toml` | `uv sync` |
| `requirements.txt` | `pip install -r requirements.txt` |

```bash
cd .worktrees/<名前>

# Node.js
if [ -f package.json ]; then
    npm install
fi

# Python (uv)
if [ -f pyproject.toml ]; then
    uv sync
fi
```

### 6. ベースラインテストの実行

環境が正常に構築されたことを確認:

```bash
# Node.js
npm run build 2>&1 | head -20

# Python
cd tools && uv run pytest --co -q 2>&1 | head -10
```

### 7. 結果報告

作成完了後、以下を報告:

```markdown
## Worktree Created

| 項目 | 値 |
|------|-----|
| パス | `.worktrees/<名前>` |
| ブランチ | `<ブランチ名>` |
| 環境変数 | コピー済み / 未設定 |
| 依存関係 | インストール済み |
| テスト | PASS / FAIL |

次のステップ:
cd .worktrees/<名前>
```

## クイックリファレンス

| 操作 | コマンド |
|------|----------|
| 作成（新規ブランチ） | `git worktree add .worktrees/<名前> -b <ブランチ>` |
| 作成（既存ブランチ） | `git worktree add .worktrees/<名前> <ブランチ>` |
| 一覧表示 | `git worktree list` |
| 削除 | `git worktree remove .worktrees/<名前>` |
| クリーンアップ | `git worktree prune` |
| 移動 | `git worktree move .worktrees/<旧名> .worktrees/<新名>` |

## よくある間違い

### NG: worktree内でブランチを切り替える

```bash
# worktree内でこれをやってはいけない
cd .worktrees/feature-xxx
git checkout other-branch  # NG!
```

worktreeは特定のブランチに紐づいているため、ブランチを切り替えると問題が発生する。別のブランチで作業したい場合は新しいworktreeを作成する。

### NG: worktreeディレクトリを直接削除

```bash
# これをやってはいけない
rm -rf .worktrees/feature-xxx  # NG!
```

必ず `git worktree remove` を使用する。直接削除するとgitの参照が残り、orphaned worktreeになる。

## 統合情報

### .gitignore

`.worktrees/` は `.gitignore` に追加済み。コミットされない。

### task-start.mdとの関係

このスキルは `.claude/rules/task-start.md` の「git worktree の活用」セクションの詳細実装。タスク開始時に隔離環境が必要な場合はこのスキルを使用する。
