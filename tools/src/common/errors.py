"""カスタム例外定義モジュール"""


class BaseAgentError(Exception):
    """エージェント基底例外"""

    def __init__(self, message: str, details: dict | None = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class ConfigurationError(BaseAgentError):
    """設定エラー"""

    pass


class APIError(BaseAgentError):
    """API呼び出しエラー"""

    pass


class RateLimitError(APIError):
    """レート制限エラー"""

    pass


class ToolExecutionError(BaseAgentError):
    """ツール実行エラー"""

    pass


class SearchError(ToolExecutionError):
    """検索エラー"""

    pass


class ValidationError(BaseAgentError):
    """バリデーションエラー"""

    pass


class MaxRetryError(BaseAgentError):
    """最大リトライ回数超過エラー"""

    pass
