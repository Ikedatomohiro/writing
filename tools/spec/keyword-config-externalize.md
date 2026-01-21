# キーワード設定の外部化 スペック

## 概要

`main.py` にハードコードされているキーワードカテゴリとシードキーワードを外部設定ファイルに移行する。

## 背景・目的

現状、`main.py:18-22` に以下がハードコードされている:

```python
input_data = KeywordSearchInput(
    category="資産形成",
    seed_keywords=["iDeCo", "積立NISA"],
    depth=2,
)
```

これにより:
- カテゴリやキーワードを変更するたびにコード修正が必要
- 複数カテゴリの一括実行ができない
- 設定の履歴管理が困難

## 要件

### 機能要件

1. **外部設定ファイル**: YAML/JSON形式でカテゴリとシードキーワードを定義できる
2. **複数カテゴリ対応**: 1回の実行で複数カテゴリを処理できる
3. **CLI引数対応**: コマンドラインからカテゴリを指定して実行できる
4. **デフォルト設定**: 引数なしの場合は全カテゴリまたは指定カテゴリを実行

### 非機能要件

1. **後方互換性**: 既存の動作を壊さない
2. **拡張性**: 新しいカテゴリを簡単に追加できる
3. **バリデーション**: 設定ファイルの形式エラーを検出できる

## 設定ファイル形式

### 配置場所

`tools/config/keywords.yaml`

### スキーマ

```yaml
# キーワード検索設定
version: "1.0"

categories:
  資産形成:
    description: "資産形成・投資関連"
    seed_keywords:
      - iDeCo
      - 積立NISA
      - 投資信託
      - 家計管理
    depth: 2

  健康:
    description: "健康・ウェルネス関連"
    seed_keywords:
      - 健康管理
      - 睡眠
      - 運動
      - メンタルヘルス
    depth: 2

  エンジニア:
    description: "技術・エンジニアリング関連"
    seed_keywords:
      - AI
      - バックエンド
      - クラウド
      - DevOps
    depth: 2

defaults:
  depth: 2
  run_all: false  # trueの場合、引数なしで全カテゴリ実行
```

## CLI インターフェース

```bash
# 特定カテゴリを実行
uv run python main.py --category 資産形成

# 複数カテゴリを実行
uv run python main.py --category 資産形成 --category 健康

# 全カテゴリを実行
uv run python main.py --all

# カテゴリ一覧を表示
uv run python main.py --list

# ヘルプ
uv run python main.py --help
```

## 制約事項

- 設定ファイルはYAML形式（PyYAMLを使用）
- カテゴリ名は日本語可
- シードキーワードは最低1つ必要

## 成功基準

1. 設定ファイルからカテゴリとキーワードを読み込んで実行できる
2. CLI引数でカテゴリを指定できる
3. 設定ファイルのバリデーションエラーが適切に表示される
4. 既存のテストが通る
5. 新規テストのカバレッジ80%以上
