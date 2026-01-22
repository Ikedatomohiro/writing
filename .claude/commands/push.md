git add, commit, push, PR作成を実行してください。

**重要**: 確認なしで最後まで実行すること。途中でユーザーに確認を求めない。

## コミット

コミットメッセージは変更内容を簡潔に日本語で記述してください。
Conventional Commits のルールに従ってください。

コミットの粒度（小さく保つ）:
- 1コミット = 1つの論理的な変更
- 迷ったら分ける
- 関連性のない変更は必ず別コミットにする

## PR作成

pushが完了したら、`gh pr create`でPRを作成してください。

PRの粒度（小さく保つ）:
- 1PR = 1つの機能または修正
- 大きな変更は複数PRに分割することを検討
- レビューしやすいサイズを意識する

PRのフォーマット:
```
## Summary
- 変更内容を箇条書きで記載

## Test plan
- テスト内容を箇条書きで記載

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

## GitHub CIテストの確認（必須）

PR作成後、GitHubのCIテストが完了するまで待機し、結果を確認すること。

```bash
# PRのチェック状態を監視（完了まで待機）
gh pr checks --watch

# または特定のPR番号を指定
gh pr checks <PR番号> --watch
```

**テストが失敗した場合**:
- 失敗したテストの内容を確認
- 修正してコミット・pushし、再度テストが通ることを確認
- テストが通るまでコマンドを完了としない

## 事前確認

以下が完了していることを確認してからpushしてください。
- .claude/rules/testing.md に記載されているテストが全て成功していること
- .claude/rules/coding-style.md に記載されているコーディングスタイルに従っていること
- .claude/rules/security.md に記載されているセキュリティ要件を満たしていること
