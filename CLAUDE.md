# CLAUDE.md

ブログ記事の表示・管理を行うWebアプリ（Next.js 15）。

## ビルド・テスト

```bash
npm run dev          # 開発サーバー
npm run build        # ビルド
npx vitest run       # テスト
```

## 重要ルール

- **worktreeは任意**: 通常は main で直接作業してよい。**複数ブランチを並行で扱う場合のみ** `.worktrees/` 配下で作業する
- **TDD**: テストを先に書く。失敗確認 → 最小実装 → リファクタ
- **スタイリング**: Tailwind CSS v4（`@theme inline` で設定）。Chakra UI は使わない

## 技術スタック

- Next.js 15 (App Router) / React 19 / TypeScript / Tailwind CSS v4

## 詳細ルール

`.claude/rules/` 配下を参照:
- `task-start.md` - タスク開始手順（worktree作成、Issue確認）
- `testing.md` - テスト規約
- `coding-style.md` - コーディングスタイル
- `implementation-workflow.md` - spec.md → plan.md → task.md ワークフロー
- `security.md` - セキュリティ
