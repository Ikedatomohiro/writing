"""web_search.py のテスト"""

from unittest.mock import MagicMock, patch

import pytest

from src.common.errors import SearchError
from src.tools.web_search import (
    SearchResult,
    WebSearchInput,
    _mock_search_results,
    _search_with_serpapi,
    search_web,
)


class TestSearchResult:
    """SearchResult のテスト"""

    def test_valid_result(self):
        result = SearchResult(
            title="テスト記事",
            link="https://example.com/test",
            snippet="これはテストです",
        )
        assert result.title == "テスト記事"
        assert result.link == "https://example.com/test"
        assert result.snippet == "これはテストです"


class TestWebSearchInput:
    """WebSearchInput のテスト"""

    def test_with_default_num_results(self):
        input_data = WebSearchInput(query="テスト")
        assert input_data.query == "テスト"
        assert input_data.num_results == 10

    def test_with_custom_num_results(self):
        input_data = WebSearchInput(query="テスト", num_results=5)
        assert input_data.num_results == 5


class TestMockSearchResults:
    """_mock_search_results のテスト"""

    def test_returns_mock_results(self):
        results = _mock_search_results("iDeCo", 3)
        assert len(results) == 3
        assert all(isinstance(r, SearchResult) for r in results)
        assert "iDeCo" in results[0].title

    def test_respects_num_results(self):
        results = _mock_search_results("テスト", 2)
        assert len(results) == 2

    def test_with_spaces_in_query(self):
        results = _mock_search_results("積立 NISA", 1)
        assert len(results) == 1
        assert "積立-NISA" in results[0].link


class TestSearchWithSerpapi:
    """_search_with_serpapi のテスト"""

    @patch("src.tools.web_search.httpx.Client")
    @patch("src.tools.web_search.settings")
    def test_successful_search(self, mock_settings, mock_client_class):
        mock_settings.serpapi_api_key = "test-api-key"

        mock_response = MagicMock()
        mock_response.json.return_value = {
            "organic_results": [
                {
                    "title": "結果1",
                    "link": "https://example.com/1",
                    "snippet": "スニペット1",
                },
                {
                    "title": "結果2",
                    "link": "https://example.com/2",
                    "snippet": "スニペット2",
                },
            ]
        }
        mock_response.raise_for_status = MagicMock()

        mock_client = MagicMock()
        mock_client.__enter__ = MagicMock(return_value=mock_client)
        mock_client.__exit__ = MagicMock(return_value=False)
        mock_client.get.return_value = mock_response
        mock_client_class.return_value = mock_client

        results = _search_with_serpapi("テスト", 10)

        assert len(results) == 2
        assert results[0].title == "結果1"
        assert results[1].link == "https://example.com/2"

    @patch("src.tools.web_search.httpx.Client")
    @patch("src.tools.web_search.settings")
    def test_empty_results(self, mock_settings, mock_client_class):
        mock_settings.serpapi_api_key = "test-api-key"

        mock_response = MagicMock()
        mock_response.json.return_value = {"organic_results": []}
        mock_response.raise_for_status = MagicMock()

        mock_client = MagicMock()
        mock_client.__enter__ = MagicMock(return_value=mock_client)
        mock_client.__exit__ = MagicMock(return_value=False)
        mock_client.get.return_value = mock_response
        mock_client_class.return_value = mock_client

        results = _search_with_serpapi("テスト", 10)

        assert len(results) == 0

    @patch("src.tools.web_search.httpx.Client")
    @patch("src.tools.web_search.settings")
    def test_respects_num_results_limit(self, mock_settings, mock_client_class):
        mock_settings.serpapi_api_key = "test-api-key"

        mock_response = MagicMock()
        mock_response.json.return_value = {
            "organic_results": [
                {"title": f"結果{i}", "link": f"https://example.com/{i}", "snippet": f"スニペット{i}"}
                for i in range(10)
            ]
        }
        mock_response.raise_for_status = MagicMock()

        mock_client = MagicMock()
        mock_client.__enter__ = MagicMock(return_value=mock_client)
        mock_client.__exit__ = MagicMock(return_value=False)
        mock_client.get.return_value = mock_response
        mock_client_class.return_value = mock_client

        results = _search_with_serpapi("テスト", 3)

        assert len(results) == 3


class TestSearchWeb:
    """search_web のテスト"""

    @patch("src.tools.web_search.settings")
    def test_returns_mock_when_no_api_key(self, mock_settings):
        mock_settings.serpapi_api_key = None

        results = search_web.invoke({"query": "テスト", "num_results": 3})

        assert len(results) == 3
        assert all(isinstance(r, SearchResult) for r in results)

    @patch("src.tools.web_search._search_with_serpapi")
    @patch("src.tools.web_search.settings")
    def test_calls_serpapi_when_api_key_exists(self, mock_settings, mock_search):
        mock_settings.serpapi_api_key = "test-key"
        mock_search.return_value = [
            SearchResult(title="結果", link="https://example.com", snippet="スニペット")
        ]

        results = search_web.invoke({"query": "テスト", "num_results": 10})

        mock_search.assert_called_once_with("テスト", 10)
        assert len(results) == 1

    @patch("src.tools.web_search._search_with_serpapi")
    @patch("src.tools.web_search.settings")
    def test_raises_search_error_on_exception(self, mock_settings, mock_search):
        mock_settings.serpapi_api_key = "test-key"
        mock_search.side_effect = Exception("API error")

        with pytest.raises(SearchError) as exc_info:
            search_web.invoke({"query": "テスト", "num_results": 10})

        assert "Web検索に失敗しました" in str(exc_info.value)
