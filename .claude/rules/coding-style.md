# Coding Style Rules

## 基本原則

1. **可読性優先**: コードは書く回数より読む回数の方が多い
2. **KISS**: シンプルな解決策を選ぶ
3. **DRY**: 共通ロジックは関数/クラスに抽出
4. **YAGNI**: 必要になるまで機能を追加しない

## ファイル構成

- **推奨サイズ**: 200-400行
- **上限**: 800行（超える場合は分割を検討）
- **構成**: 機能ドメインごとに整理

## Python スタイルガイド

### 命名規則

```python
# 変数・関数: snake_case
user_count = 0
def calculate_total_price():
    pass

# クラス: PascalCase
class UserRepository:
    pass

# 定数: UPPER_SNAKE_CASE
MAX_RETRY_COUNT = 3
DEFAULT_TIMEOUT = 30
```

### 型ヒント

```python
# 関数には型ヒントを付ける
def get_user_by_id(user_id: int) -> User | None:
    ...

# コレクションの型も明示
def process_items(items: list[str]) -> dict[str, int]:
    ...
```

### イミュータビリティ

```python
# NG: 引数を直接変更
def add_item(items: list, item: str) -> list:
    items.append(item)  # 副作用あり
    return items

# OK: 新しいリストを返す
def add_item(items: list, item: str) -> list:
    return [*items, item]
```

### エラーハンドリング

```python
# NG: 裸のexcept
try:
    process()
except:  # 何でもキャッチしてしまう
    pass

# OK: 具体的な例外を指定
try:
    process()
except ValueError as e:
    logger.warning(f"Invalid value: {e}")
    raise
except IOError as e:
    logger.error(f"IO error: {e}")
    return None
```

### 関数設計

```python
# NG: 長すぎる関数
def process_order(order):
    # 100行以上のコード...
    pass

# OK: 小さな関数に分割
def process_order(order: Order) -> ProcessedOrder:
    validated = validate_order(order)
    calculated = calculate_totals(validated)
    return finalize_order(calculated)
```

## 品質チェックリスト

コミット前に確認:

- [ ] 関数は50行以下か
- [ ] ネストは4レベル以下か
- [ ] マジックナンバーを定数化したか
- [ ] デバッグ用のprint/logging.debugを削除したか
- [ ] 型ヒントを付けたか
- [ ] docstringを書いたか（公開関数のみ）
