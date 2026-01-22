---
name: pr-review
description: PRのコードレビューを実行する。spec.mdとの整合性、セキュリティ、コード品質、ディレクトリ構成を検証する。ユーザーが「/pr-review」や「PRレビューして」と言った時に使用する。
---

# PR Review

PRの変更内容を多角的にレビューする。

## レビュー手順

### 1. 変更内容の把握

```bash
# 変更ファイル一覧
git diff --name-only origin/main...HEAD

# 変更差分
git diff origin/main...HEAD
```

### 2. spec.mdとの整合性確認

対象機能のspec.mdが存在する場合、以下を確認:

- [ ] すべての要件が実装されているか
- [ ] 仕様と異なる挙動がないか
- [ ] 不足している機能がないか

spec.mdが見つからない場合はスキップし、その旨を報告する。

### 3. セキュリティレビュー

`.claude/rules/security.md`の観点で確認:

- [ ] シークレットのハードコードがないか
- [ ] 入力バリデーションが適切か
- [ ] SQLインジェクション/XSS対策
- [ ] エラーメッセージに機密情報が含まれないか

詳細: [references/security-checklist.md](references/security-checklist.md)

### 4. コード品質レビュー

- [ ] 冗長な記述がないか（重複コード、不要な処理）
- [ ] 関数は適切なサイズか（50行以下推奨）
- [ ] ファイルサイズが適切か（400行以下推奨）
- [ ] ネストが深すぎないか（4レベル以下）
- [ ] 命名は明確か
- [ ] エラーハンドリングが適切か
- [ ] デバッグコードが残っていないか
- [ ] テストカバレッジが十分か

#### Python固有チェック

- [ ] 型ヒントが適切に使用されているか
- [ ] `async/await` の使用が適切か
- [ ] 例外処理が具体的か（bare except を避ける）
- [ ] f-string を適切に使用しているか
- [ ] `pathlib` を使用しているか（os.path より推奨）

### 5. パフォーマンスレビュー

- [ ] アルゴリズムの効率性（O(n²)などの非効率なループがないか）
- [ ] 不要な再計算がないか
- [ ] データベースクエリの最適化（N+1問題など）
- [ ] 適切なキャッシング

### 6. 構造レビュー

**上下関係（階層構造）**:
- [ ] ディレクトリ配置は機能ドメインに沿っているか
- [ ] 依存関係の方向は適切か（上位→下位のみ）
- [ ] 循環参照がないか

**並列関係（同階層の整合性）**:
- [ ] 同階層のモジュールは同じ抽象度か
- [ ] 命名規則が統一されているか
- [ ] 責務の分離が明確か

詳細: [references/structure-checklist.md](references/structure-checklist.md)

## 出力フォーマット

指摘は重大度別に分類する:
- **Critical**: 修正必須（セキュリティ、重大なバグ）
- **High**: 強く推奨（品質・保守性に大きく影響）
- **Medium**: 推奨（改善が望ましい）

```markdown
## PR Review: [機能名]

### 概要
[変更内容の要約]

### spec.md整合性
- 結果: OK / NG / N/A
- 詳細: [具体的な指摘]

### 指摘事項

#### Critical（修正必須）
- [ファイル:行番号] 問題の説明
  推奨修正: [修正案]

#### High（強く推奨）
- ...

#### Medium（推奨）
- ...

### 総合判定
- [ ] Approve（Critical/Highなし）
- [ ] Request Changes（Critical/Highあり）
```

## GitHubへのコメント投稿

レビュー完了後、以下のコマンドでGitHubにコメントを投稿する。

### PRレビューとして投稿

```bash
# Approve（承認）
gh pr review --approve --body "レビュー内容"

# Request Changes（修正依頼）
gh pr review --request-changes --body "レビュー内容"

# Comment（コメントのみ）
gh pr review --comment --body "レビュー内容"
```

### 投稿時の注意

- 長文の場合はHEREDOCを使用する
- Critical/Highの指摘がある場合は `--request-changes` を使用
- 指摘がない場合は `--approve` を使用
