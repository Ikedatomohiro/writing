---
name: using-git-worktrees
description: 機能開発時に隔離されたワークスペースを作成する。ディレクトリ選択とセーフティ検証を自動化。新機能実装やブランチ作業を開始する際に使用する。ユーザーが「/worktree」「worktreeを作成して」「隔離環境で作業したい」と言った時に使用する。
---

# Using Git Worktrees

機能開発のための隔離されたワークスペースを安全に作成する。

## 使用方法

### シェルスクリプトで実行

このスキルは `create-worktree.sh` を使用してworktreeを作成する。

```bash
# スクリプトのパス
.claude/skills/using-git-worktrees/create-worktree.sh
```

### 引数

| 引数 | 必須 | 説明 |
|------|------|------|
| `<worktree名>` | Yes | `.worktrees/`配下に作成するディレクトリ名 |
| `[ブランチ名]` | No | 使用するブランチ名（省略時はworktree名と同じ） |
| `-b` | No | 新規ブランチを作成する場合に指定 |
| `-f` | No | 確認プロンプトをスキップ（Claude Code等の非対話環境用） |

### 実行例

```bash
# 新規ブランチで作成（ブランチ名 = worktree名）
bash .claude/skills/using-git-worktrees/create-worktree.sh feature-auth -b

# 新規ブランチで作成（ブランチ名を指定）
bash .claude/skills/using-git-worktrees/create-worktree.sh my-worktree feature/auth -b

# 既存ブランチで作成
bash .claude/skills/using-git-worktrees/create-worktree.sh feature-login feature/login

# Claude Codeから実行（確認プロンプトをスキップ）
bash .claude/skills/using-git-worktrees/create-worktree.sh feature-auth -b -f
```

## スクリプトの処理内容

`create-worktree.sh` は以下を自動で実行する:

1. **セーフティ検証**
   - 未コミットの変更がないか確認
   - 同名のworktreeが存在しないか確認
   - orphaned worktreeのクリーンアップ

2. **worktree作成**
   - `.worktrees/`ディレクトリに作成
   - 新規または既存ブランチの選択

3. **環境変数のコピー**
   - `.env`, `.env.local` をコピー
   - `tools/.env` もコピー

4. **依存関係のインストール**
   - `npm install`（package.jsonがある場合）
   - `uv sync`（pyproject.tomlがある場合）

5. **ベースラインテスト**
   - `npm run build` の実行確認
   - `pytest --co` の実行確認

6. **結果報告**
   - 作成完了のサマリーを表示

## ディレクトリ構成

```
/Users/tomo/Desktop/workspace/writing/
├── .worktrees/           # worktree配置ディレクトリ
│   ├── feature-auth/     # 認証機能開発用
│   └── fix-bug-123/      # バグ修正用
├── .claude/
│   └── skills/
│       └── using-git-worktrees/
│           ├── SKILL.md
│           └── create-worktree.sh
├── app/
├── tools/
└── ...
```

## 命名規則

```
.worktrees/<ブランチ種別>-<簡潔な説明>
```

例:
- `.worktrees/feature-user-profile`
- `.worktrees/fix-login-error`
- `.worktrees/refactor-api-layer`

## クイックリファレンス

| 操作 | コマンド |
|------|----------|
| 作成（新規ブランチ） | `bash .claude/skills/using-git-worktrees/create-worktree.sh <名前> -b` |
| 作成（既存ブランチ） | `bash .claude/skills/using-git-worktrees/create-worktree.sh <名前> <ブランチ>` |
| 一覧表示 | `git worktree list` |
| 削除 | `git worktree remove .worktrees/<名前>` |
| クリーンアップ | `git worktree prune` |

## よくある間違い

### NG: worktree内でブランチを切り替える

```bash
# worktree内でこれをやってはいけない
cd .worktrees/feature-xxx
git checkout other-branch  # NG!
```

worktreeは特定のブランチに紐づいているため、ブランチを切り替えると問題が発生する。

### NG: worktreeディレクトリを直接削除

```bash
# これをやってはいけない
rm -rf .worktrees/feature-xxx  # NG!
```

必ず `git worktree remove` を使用する。

## 統合情報

### task-start.mdとの関係

`.claude/rules/task-start.md` では、タスク開始時に本スキルの使用が必須化されている。
