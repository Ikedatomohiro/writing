# CLAUDE.md

このファイルはClaude Codeにプロジェクトのコンテキストを提供します。

## プロジェクト概要

エージェント開発のためのPythonプロジェクト。

## 技術スタック

- **言語**: Python 3.13
- **パッケージ管理**: uv
- **リンター/フォーマッター**: ruff
- **テスト**: pytest
- **エージェントフレームワーク**: LangChain, LangGraph

## ディレクトリ構造

```
writing/
├── .claude/           # Claude Code設定
│   ├── agents/        # サブエージェント定義
│   ├── commands/      # スラッシュコマンド
│   ├── rules/         # コーディングガイドライン
│   └── hooks.json     # 自動化フック
├── spec/              # エージェントスペック
├── main.py            # エントリーポイント
└── pyproject.toml     # プロジェクト設定
```

## 開発ワークフロー

### コマンド

```bash
# 実行
uv run python main.py

# テスト
uv run pytest

# リント
uv run ruff check .

# フォーマット
uv run ruff format .
```

### Claude Codeコマンド

- `/plan [機能]` - 実装計画を作成
- `/review` - コード変更をレビュー
- `/architect [課題]` - アーキテクチャ設計
- `/test` - テスト実行
- `/push [メッセージ]` - git add, commit, push

## コーディング規約

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

## エージェント

- `.claude/agents/planner.md` - 計画作成
- `.claude/agents/architect.md` - アーキテクチャ設計
- `.claude/agents/code-reviewer.md` - コードレビュー
