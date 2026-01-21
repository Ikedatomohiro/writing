# キーワード設定の外部化 タスク

## Phase 1: 設定ファイル基盤

- [ ] `tools/config/` ディレクトリを作成
- [ ] `tools/config/keywords.yaml` を作成（3カテゴリ定義）
- [ ] PyYAMLの依存を確認・追加（`pyproject.toml`）
- [ ] `tools/src/common/keyword_config.py` を新規作成
  - [ ] Pydanticモデル定義（CategoryConfig, KeywordConfig）
  - [ ] YAML読み込み関数
  - [ ] バリデーション処理
- [ ] `tools/tests/common/test_keyword_config.py` を作成
  - [ ] 正常読み込みテスト
  - [ ] バリデーションエラーテスト
  - [ ] デフォルト値テスト

## Phase 2: CLI対応

- [ ] `argparse` でCLI引数パーサーを実装
  - [ ] `--category` オプション（複数指定可）
  - [ ] `--all` オプション
  - [ ] `--list` オプション
  - [ ] `--help` の説明文
- [ ] CLIのテストを作成

## Phase 3: 統合・リファクタリング

- [ ] `main.py` からハードコードを削除
- [ ] 設定ファイル読み込みに変更
- [ ] 複数カテゴリの逐次実行を実装
- [ ] 既存テストが通ることを確認
- [ ] 統合テストを作成

## 完了条件

- [ ] `uv run python main.py --category 資産形成` で実行できる
- [ ] `uv run python main.py --all` で全カテゴリ実行できる
- [ ] `uv run python main.py --list` でカテゴリ一覧表示
- [ ] 設定ファイルエラー時に適切なメッセージが出る
- [ ] テストカバレッジ80%以上
- [ ] `uv run ruff check .` がパス
- [ ] 既存テストがすべてパス
