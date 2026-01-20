"""llm_client.py のテスト"""

from unittest.mock import MagicMock, patch

from pydantic import BaseModel

from src.models.llm_client import get_chat_model, get_structured_model


class TestGetChatModel:
    """get_chat_model のテスト"""

    @patch("src.models.llm_client.ChatOpenAI")
    @patch("src.models.llm_client.settings")
    def test_with_default_values(self, mock_settings, mock_chat_openai):
        mock_settings.default_model = "gpt-4o-mini"
        mock_settings.temperature = 0.7
        mock_settings.max_tokens = 1000
        mock_settings.openai_api_key = "test-key"

        get_chat_model()

        mock_chat_openai.assert_called_once_with(
            model="gpt-4o-mini",
            temperature=0.7,
            max_tokens=1000,
            api_key="test-key",
        )

    @patch("src.models.llm_client.ChatOpenAI")
    @patch("src.models.llm_client.settings")
    def test_with_custom_values(self, mock_settings, mock_chat_openai):
        mock_settings.default_model = "gpt-4o-mini"
        mock_settings.temperature = 0.7
        mock_settings.max_tokens = 1000
        mock_settings.openai_api_key = "test-key"

        get_chat_model(model="gpt-4o", temperature=0.5, max_tokens=2000)

        mock_chat_openai.assert_called_once_with(
            model="gpt-4o",
            temperature=0.5,
            max_tokens=2000,
            api_key="test-key",
        )

    @patch("src.models.llm_client.ChatOpenAI")
    @patch("src.models.llm_client.settings")
    def test_with_zero_temperature(self, mock_settings, mock_chat_openai):
        """temperature=0 が正しく処理されることを確認"""
        mock_settings.default_model = "gpt-4o-mini"
        mock_settings.temperature = 0.7
        mock_settings.max_tokens = 1000
        mock_settings.openai_api_key = "test-key"

        get_chat_model(temperature=0)

        mock_chat_openai.assert_called_once_with(
            model="gpt-4o-mini",
            temperature=0,
            max_tokens=1000,
            api_key="test-key",
        )


class TestGetStructuredModel:
    """get_structured_model のテスト"""

    @patch("src.models.llm_client.get_chat_model")
    def test_with_schema(self, mock_get_chat_model):
        class TestSchema(BaseModel):
            name: str
            value: int

        mock_model = MagicMock()
        mock_get_chat_model.return_value = mock_model

        get_structured_model(TestSchema, model="gpt-4o", temperature=0.5)

        mock_get_chat_model.assert_called_once_with(model="gpt-4o", temperature=0.5)
        mock_model.with_structured_output.assert_called_once_with(TestSchema)
