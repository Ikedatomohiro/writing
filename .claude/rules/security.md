# Security Rules

## 必須チェック項目

コミット前に以下を必ず確認すること。

### シークレット管理

**禁止**:
```python
# NG: ハードコード
API_KEY = "sk-1234567890abcdef"
DATABASE_URL = "postgresql://user:password@localhost/db"
```

**推奨**:
```python
# OK: 環境変数から取得
import os

API_KEY = os.environ.get("API_KEY")
if not API_KEY:
    raise ValueError("API_KEY environment variable is required")
```

### 入力バリデーション

全てのユーザー入力を検証すること。

```python
# Pydanticを使用した例
from pydantic import BaseModel, EmailStr, validator

class UserInput(BaseModel):
    email: EmailStr
    age: int

    @validator('age')
    def age_must_be_positive(cls, v):
        if v < 0 or v > 150:
            raise ValueError('Invalid age')
        return v
```

### SQLインジェクション防止

```python
# NG: 文字列結合
query = f"SELECT * FROM users WHERE id = {user_id}"

# OK: パラメータ化クエリ
query = "SELECT * FROM users WHERE id = %s"
cursor.execute(query, (user_id,))
```

### XSS対策

- ユーザー入力をHTMLに出力する際は必ずエスケープ
- フレームワークの自動エスケープ機能を無効化しない

### 認証・認可

- セッショントークンは安全に生成（`secrets`モジュール使用）
- パスワードは必ずハッシュ化（bcrypt, argon2）
- 最小権限の原則を適用

## 脆弱性発見時の対応

1. 作業を即座に中断
2. 問題の範囲を特定
3. 露出した可能性のある認証情報をローテーション
4. 類似の脆弱性がないかコードベース全体を監査

## エラーハンドリング

```python
# NG: 詳細なエラー情報を公開
except Exception as e:
    return {"error": str(e)}  # スタックトレースが漏洩する可能性

# OK: 一般的なメッセージを返す
except Exception as e:
    logger.error(f"Internal error: {e}")
    return {"error": "An internal error occurred"}
```
