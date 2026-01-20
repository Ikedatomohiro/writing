"""errors.py のテスト"""


from src.common.errors import (
    APIError,
    BaseAgentError,
    ConfigurationError,
    MaxRetryError,
    RateLimitError,
    SearchError,
    ToolExecutionError,
    ValidationError,
)


class TestBaseAgentError:
    """BaseAgentError のテスト"""

    def test_init_with_message_only(self):
        error = BaseAgentError("テストエラー")
        assert error.message == "テストエラー"
        assert error.details == {}
        assert str(error) == "テストエラー"

    def test_init_with_details(self):
        details = {"key": "value", "code": 123}
        error = BaseAgentError("詳細付きエラー", details=details)
        assert error.message == "詳細付きエラー"
        assert error.details == details

    def test_is_exception(self):
        error = BaseAgentError("例外テスト")
        assert isinstance(error, Exception)


class TestConfigurationError:
    """ConfigurationError のテスト"""

    def test_inheritance(self):
        error = ConfigurationError("設定エラー")
        assert isinstance(error, BaseAgentError)
        assert error.message == "設定エラー"


class TestAPIError:
    """APIError のテスト"""

    def test_inheritance(self):
        error = APIError("APIエラー")
        assert isinstance(error, BaseAgentError)

    def test_with_details(self):
        error = APIError("APIエラー", details={"status_code": 500})
        assert error.details["status_code"] == 500


class TestRateLimitError:
    """RateLimitError のテスト"""

    def test_inheritance(self):
        error = RateLimitError("レート制限")
        assert isinstance(error, APIError)
        assert isinstance(error, BaseAgentError)


class TestToolExecutionError:
    """ToolExecutionError のテスト"""

    def test_inheritance(self):
        error = ToolExecutionError("ツール実行エラー")
        assert isinstance(error, BaseAgentError)


class TestSearchError:
    """SearchError のテスト"""

    def test_inheritance(self):
        error = SearchError("検索エラー")
        assert isinstance(error, ToolExecutionError)
        assert isinstance(error, BaseAgentError)


class TestValidationError:
    """ValidationError のテスト"""

    def test_inheritance(self):
        error = ValidationError("バリデーションエラー")
        assert isinstance(error, BaseAgentError)


class TestMaxRetryError:
    """MaxRetryError のテスト"""

    def test_inheritance(self):
        error = MaxRetryError("リトライ上限")
        assert isinstance(error, BaseAgentError)

    def test_with_retry_details(self):
        error = MaxRetryError("リトライ上限", details={"max_retries": 3, "attempts": 3})
        assert error.details["max_retries"] == 3
        assert error.details["attempts"] == 3
