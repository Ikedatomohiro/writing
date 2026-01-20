"""embeddings.py のテスト"""

from unittest.mock import patch


from src.models.embeddings import get_embeddings


class TestGetEmbeddings:
    """get_embeddings のテスト"""

    @patch("src.models.embeddings.OpenAIEmbeddings")
    @patch("src.models.embeddings.settings")
    def test_with_default_model(self, mock_settings, mock_embeddings):
        mock_settings.openai_api_key = "test-key"

        get_embeddings()

        mock_embeddings.assert_called_once_with(
            model="text-embedding-3-small",
            api_key="test-key",
        )

    @patch("src.models.embeddings.OpenAIEmbeddings")
    @patch("src.models.embeddings.settings")
    def test_with_custom_model(self, mock_settings, mock_embeddings):
        mock_settings.openai_api_key = "test-key"

        get_embeddings(model="text-embedding-3-large")

        mock_embeddings.assert_called_once_with(
            model="text-embedding-3-large",
            api_key="test-key",
        )
