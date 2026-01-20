# /test コマンド

テストを実行し、結果を分析します。

## 使用方法

```
/test              # 全テスト実行
/test [パス]       # 特定のテストを実行
/test --coverage   # カバレッジ付きで実行
```

## 実行内容

1. pytest でテストを実行
2. 失敗したテストを分析
3. カバレッジレポートを確認（オプション）
4. 改善提案を出力

## 実行コマンド例

```bash
# 全テスト
uv run pytest

# カバレッジ付き
uv run pytest --cov=src --cov-report=term-missing

# 特定のテスト
uv run pytest tests/test_user.py -v

# 失敗時に即停止
uv run pytest -x
```

## テスト失敗時の対応

1. エラーメッセージを分析
2. 関連するコードを確認
3. `.claude/rules/testing.md` のガイドラインに従って修正
