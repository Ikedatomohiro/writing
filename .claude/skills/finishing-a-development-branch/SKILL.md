---
name: finishing-a-development-branch
description: 開発ブランチの完了処理を行う。テスト確認後、マージ/PR作成/保持/破棄の4つの選択肢を提示し、選択に応じた処理を実行する。
---

# Finishing a Development Branch

開発作業の完了処理を行い、選択肢を提示して実行する。

**Core principle:** テスト確認 → 選択肢提示 → 選択を実行 → クリーンアップ

**開始時のアナウンス:** 「finishing-a-development-branchスキルを使用して開発作業を完了します。」

## プロセス

### Step 1: テストの確認

**選択肢を提示する前に、テストが通ることを確認:**

```bash
# プロジェクトのテストスイートを実行
# このプロジェクトの場合:
npm test                    # Next.js
(cd tools && uv run pytest) # Python
```

**テストが失敗した場合:**
```
テスト失敗（N件）。完了前に修正が必要です:

[失敗内容を表示]

テストが通るまでマージ/PR作成はできません。
```

ここで停止。Step 2に進まない。

**テストが通った場合:** Step 2に進む。

### Step 2: ベースブランチの特定

```bash
# 一般的なベースブランチを試す
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

または確認: 「このブランチはmainから分岐しました - 正しいですか？」

### Step 3: 選択肢の提示

以下の4つの選択肢を正確に提示:

```
実装が完了しました。どうしますか？

1. <base-branch>にローカルでマージ
2. プッシュしてPull Requestを作成
3. ブランチをこのまま保持（後で自分で処理する）
4. この作業を破棄

どれにしますか？
```

**説明は追加しない** - 選択肢は簡潔に。

### Step 4: 選択の実行

#### Option 1: ローカルでマージ

```bash
# ベースブランチに切り替え
git checkout <base-branch>

# 最新を取得
git pull

# フィーチャーブランチをマージ
git merge <feature-branch>

# マージ結果のテストを確認
<test command>

# テストが通った場合
git branch -d <feature-branch>
```

その後: worktreeのクリーンアップ（Step 5）

#### Option 2: プッシュしてPRを作成

```bash
# ブランチをプッシュ
git push -u origin <feature-branch>

# PRを作成
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
<変更内容を2-3箇条書き>

## Test Plan
- [ ] <確認手順>
EOF
)"
```

**worktreeは保持する。** PRレビュー中に修正が必要になる可能性があるため。

#### Option 3: そのまま保持

報告: 「ブランチ <name> を保持します。worktreeは <path> に残ります。」

**worktreeはクリーンアップしない。**

#### Option 4: 破棄

**まず確認:**
```
以下を完全に削除します:
- ブランチ <name>
- すべてのコミット: <commit-list>
- worktree: <path>

確認のため「discard」と入力してください。
```

正確な確認を待つ。

確認された場合:
```bash
git checkout <base-branch>
git branch -D <feature-branch>
```

その後: worktreeのクリーンアップ（Step 5）

### Step 5: worktreeのクリーンアップ

**Option 1, 4の場合のみ:**

worktree内かどうか確認:
```bash
git worktree list | grep $(git branch --show-current)
```

worktree内の場合:
```bash
git worktree remove <worktree-path>
```

**Option 2, 3の場合:** worktreeを保持。

## クイックリファレンス

| Option | マージ | プッシュ | worktree保持 | ブランチ削除 |
|--------|--------|----------|--------------|--------------|
| 1. ローカルマージ | ✓ | - | - | ✓ |
| 2. PR作成 | - | ✓ | ✓ | - |
| 3. そのまま保持 | - | - | ✓ | - |
| 4. 破棄 | - | - | - | ✓ (強制) |

## よくある間違い

**テスト確認をスキップ**
- **問題:** 壊れたコードをマージ、失敗するPRを作成
- **対策:** 選択肢を提示する前に必ずテストを確認

**曖昧な質問**
- **問題:** 「次は何をしましょう？」→ 不明確
- **対策:** 正確に4つの構造化された選択肢を提示

**自動的なworktreeクリーンアップ**
- **問題:** 必要かもしれないのにworktreeを削除（Option 2はPRレビュー中、Option 3は保留中）
- **対策:** Option 1と4の場合のみクリーンアップ。Option 2, 3ではworktreeを保持

**破棄時の確認なし**
- **問題:** 誤って作業を削除
- **対策:** 「discard」の入力確認を必須に

## Red Flags

**Never:**
- テストが失敗したまま進める
- マージ結果のテストを確認せずにマージ
- 確認なしで作業を削除
- 明示的な要求なしにforce-push

**Always:**
- 選択肢を提示する前にテストを確認
- 正確に4つの選択肢を提示
- Option 4では入力確認を取得
- Option 1と4の場合のみworktreeをクリーンアップ

## Integration

**呼び出し元:**
- **subagent-driven-development** - 全タスク完了後
- **writing-plans** - 計画実行完了後

**連携:**
- **using-git-worktrees** - このスキルで作成したworktreeをクリーンアップ
- **merge** - Option 1の詳細な手順（既存スキル）
- **prune** - 不要なブランチの一括クリーンアップ（既存スキル）

## 既存スキルとの関係

このプロジェクトには `merge` と `prune` スキルが存在する:

| スキル | 用途 |
|--------|------|
| **merge** | PRがマージされた後のクリーンアップに特化 |
| **prune** | 不要なブランチとworktreeの一括削除 |
| **finishing-a-development-branch** | 開発完了時の4択ワークフロー |

**使い分け:**
- subagent-driven-developmentから呼び出される場合 → このスキル
- PRマージ後の片付け → `merge` スキル
- 複数の不要ブランチを整理 → `prune` スキル
