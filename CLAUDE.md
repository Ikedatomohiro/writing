# CLAUDE.md

記事作成支援のWebアプリ（Next.js 15）+ AIツール群（Python/LangGraph）。

## ビルド・テスト

```bash
npm run dev          # 開発サーバー
npm run build        # ビルド
npx vitest run       # テスト

cd tools
uv run pytest        # Pythonテスト
uv run ruff check .  # リント
```

## 重要ルール

- **worktree必須**: ファイル変更は必ず `.worktrees/` 内で作業。mainブランチ直接編集禁止
- **TDD**: テストを先に書く。失敗確認 → 最小実装 → リファクタ
- **スタイリング**: Tailwind CSS v4（`@theme inline` で設定）。Chakra UI は使わない
- **Python**: すべて `uv run` 経由で実行

## 技術スタック

- Next.js 15 (App Router) / React 19 / TypeScript / Tailwind CSS v4
- Python 3.13 / uv / LangChain / LangGraph

## 詳細ルール

`.claude/rules/` 配下を参照:
- `task-start.md` - タスク開始手順（worktree作成、Issue確認）
- `testing.md` - テスト規約
- `coding-style.md` - コーディングスタイル
- `implementation-workflow.md` - spec.md → plan.md → task.md ワークフロー
- `security.md` - セキュリティ
