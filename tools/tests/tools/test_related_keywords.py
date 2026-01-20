"""related_keywords.py のテスト"""

from unittest.mock import MagicMock, patch

import pytest

from src.common.errors import SearchError
from src.tools.related_keywords import (
    RelatedKeywordsInput,
    _get_google_suggestions,
    _mock_suggestions,
    get_related_keywords,
)


class TestRelatedKeywordsInput:
    """RelatedKeywordsInput のテスト"""

    def test_valid_input(self):
        input_data = RelatedKeywordsInput(keyword="iDeCo")
        assert input_data.keyword == "iDeCo"


class TestMockSuggestions:
    """_mock_suggestions のテスト"""

    def test_returns_suggestions_with_suffixes(self):
        result = _mock_suggestions("投資")
        assert len(result) == 10
        assert "投資 とは" in result
        assert "投資 始め方" in result
        assert "投資 おすすめ" in result

    def test_with_different_keyword(self):
        result = _mock_suggestions("iDeCo")
        assert all(kw.startswith("iDeCo ") for kw in result)


class TestGetGoogleSuggestions:
    """_get_google_suggestions のテスト"""

    @patch("src.tools.related_keywords.httpx.Client")
    def test_successful_response(self, mock_client_class):
        mock_response = MagicMock()
        mock_response.json.return_value = ["iDeCo", ["iDeCo 始め方", "iDeCo メリット"]]
        mock_response.raise_for_status = MagicMock()

        mock_client = MagicMock()
        mock_client.__enter__ = MagicMock(return_value=mock_client)
        mock_client.__exit__ = MagicMock(return_value=False)
        mock_client.get.return_value = mock_response
        mock_client_class.return_value = mock_client

        result = _get_google_suggestions("iDeCo")

        assert result == ["iDeCo 始め方", "iDeCo メリット"]

    @patch("src.tools.related_keywords.httpx.Client")
    def test_invalid_response_format(self, mock_client_class):
        mock_response = MagicMock()
        mock_response.json.return_value = {"error": "invalid"}
        mock_response.raise_for_status = MagicMock()

        mock_client = MagicMock()
        mock_client.__enter__ = MagicMock(return_value=mock_client)
        mock_client.__exit__ = MagicMock(return_value=False)
        mock_client.get.return_value = mock_response
        mock_client_class.return_value = mock_client

        result = _get_google_suggestions("iDeCo")

        assert result == []

    @patch("src.tools.related_keywords.httpx.Client")
    def test_fallback_to_mock_on_error(self, mock_client_class):
        mock_client = MagicMock()
        mock_client.__enter__ = MagicMock(return_value=mock_client)
        mock_client.__exit__ = MagicMock(return_value=False)
        mock_client.get.side_effect = Exception("Network error")
        mock_client_class.return_value = mock_client

        result = _get_google_suggestions("iDeCo")

        # モック結果が返される
        assert len(result) == 10
        assert all(kw.startswith("iDeCo ") for kw in result)


class TestGetRelatedKeywords:
    """get_related_keywords のテスト"""

    @patch("src.tools.related_keywords._get_google_suggestions")
    def test_successful_search(self, mock_get_suggestions):
        mock_get_suggestions.return_value = ["キーワード1", "キーワード2"]

        result = get_related_keywords.invoke({"keyword": "テスト"})

        assert result == ["キーワード1", "キーワード2"]
        mock_get_suggestions.assert_called_once_with("テスト")

    @patch("src.tools.related_keywords._get_google_suggestions")
    def test_raises_search_error_on_exception(self, mock_get_suggestions):
        mock_get_suggestions.side_effect = Exception("Unexpected error")

        with pytest.raises(SearchError) as exc_info:
            get_related_keywords.invoke({"keyword": "テスト"})

        assert "関連キーワードの取得に失敗しました" in str(exc_info.value)
