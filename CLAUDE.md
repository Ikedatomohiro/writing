# CLAUDE.md

このファイルはClaude Codeにプロジェクトのコンテキストを提供します。

## プロジェクト概要

記事作成支援のためのWebアプリ（Next.js）とツール群（Python）。

## 技術スタック

### Webアプリ
- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **UI**: React 19

### ツール (tools/)
- **言語**: Python 3.13
- **パッケージ管理**: uv
- **リンター/フォーマッター**: ruff
- **テスト**: pytest
- **エージェントフレームワーク**: LangChain, LangGraph

## ディレクトリ構成

<!-- ディレクトリ構成やセットアップ手順を確認したい場合は README.md を参照 -->
詳細は [README.md](./README.md) を参照。

## 開発ワークフロー

### Next.js

```bash
npm run dev      # 開発サーバー
npm run build    # ビルド
```

### Python (tools/ ディレクトリ内で実行)

**重要**: すべてのPythonコマンドは `uv run` を使用して仮想環境内で実行すること。

```bash
cd tools
uv run python main.py     # 実行
uv run pytest             # テスト
uv run ruff check .       # リント
uv run ruff format .      # フォーマット
```

### Claude Codeコマンド

- `/plan [機能]` - 実装計画を作成
- `/review` - コード変更をレビュー
- `/architect [課題]` - アーキテクチャ設計
- `/test` - テスト実行
- `/push [メッセージ]` - git add, commit, push

## コーディング規約

### TypeScript/React

- 関数コンポーネントを使用
- Server Components優先

### Python

- 型ヒントを使用する
- 関数は50行以下に保つ
- ネストは4レベル以下
- `pathlib`を使用（`os.path`より推奨）
- f-stringを使用

### セキュリティ

- 認証情報をハードコードしない
- 環境変数を使用する
- 入力は必ずバリデーション

### テスト

- TDDを推奨
- カバレッジ80%以上を目標
- pytestを使用

## ルール参照

詳細なガイドラインは以下を参照:

- `.claude/rules/security.md` - セキュリティ
- `.claude/rules/coding-style.md` - コーディングスタイル
- `.claude/rules/testing.md` - テスト
- `.claude/rules/implementation-workflow.md` - 実装ワークフロー
- `.claude/rules/task-start.md` - タスク開始手順

## エージェント

- `.claude/agents/planner.md` - 計画作成
- `.claude/agents/architect.md` - アーキテクチャ設計
- `.claude/agents/code-reviewer.md` - コードレビュー
