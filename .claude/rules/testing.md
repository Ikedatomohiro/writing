# Testing Rules

## テストカバレッジ目標

- **最低**: 80%
- **推奨**: 90%以上（重要なビジネスロジック）

## テストの種類

### ユニットテスト

個々の関数・クラスをテスト。

```python
# tests/test_calculator.py
import pytest
from src.calculator import add, divide

def test_add_positive_numbers():
    assert add(2, 3) == 5

def test_add_negative_numbers():
    assert add(-1, -1) == -2

def test_divide_by_zero():
    with pytest.raises(ZeroDivisionError):
        divide(10, 0)
```

### 統合テスト

複数のコンポーネント間の連携をテスト。

```python
# tests/integration/test_user_service.py
import pytest
from src.services.user_service import UserService
from src.repositories.user_repository import UserRepository

@pytest.fixture
def user_service(test_db):
    repo = UserRepository(test_db)
    return UserService(repo)

def test_create_and_fetch_user(user_service):
    user = user_service.create_user("test@example.com")
    fetched = user_service.get_user(user.id)
    assert fetched.email == "test@example.com"
```

### E2Eテスト

ユーザーフローをエンドツーエンドでテスト。

## TDDワークフロー

1. **Red**: 失敗するテストを先に書く
2. **Green**: テストが通る最小限の実装
3. **Refactor**: コードを改善（テストは通ったまま）

```python
# 1. まずテストを書く
def test_user_can_login():
    user = create_test_user("user@example.com", "password123")
    result = login("user@example.com", "password123")
    assert result.success is True
    assert result.token is not None

# 2. テストが失敗することを確認
# 3. 実装を書く
# 4. テストが通ることを確認
# 5. リファクタリング
```

## pytest ベストプラクティス

### Fixture の活用

```python
@pytest.fixture
def sample_user():
    return User(id=1, name="Test User", email="test@example.com")

@pytest.fixture
def mock_repository(mocker):
    return mocker.Mock(spec=UserRepository)
```

### パラメータ化テスト

```python
@pytest.mark.parametrize("input,expected", [
    ("hello", "HELLO"),
    ("World", "WORLD"),
    ("", ""),
])
def test_uppercase(input, expected):
    assert uppercase(input) == expected
```

### マーカーの使用

```python
@pytest.mark.slow
def test_heavy_computation():
    ...

@pytest.mark.integration
def test_database_connection():
    ...
```

## テスト失敗時の対応

1. テストのロジックが正しいか確認
2. モックが正しく設定されているか確認
3. テストの分離ができているか確認
4. **テストを修正するのではなく、実装を修正する**
   （テスト自体にバグがある場合を除く）
