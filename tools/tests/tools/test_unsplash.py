"""Tests for Unsplash API client."""

from unittest.mock import MagicMock, patch

import pytest


class TestSearchUnsplashPhotos:
    """search_unsplash_photos function tests."""

    def test_returns_empty_list_when_no_api_key(self):
        from src.tools.unsplash import search_unsplash_photos

        with patch.dict("os.environ", {}, clear=True):
            result = search_unsplash_photos("sunset")
        assert result == []

    def test_returns_empty_list_when_empty_api_key(self):
        from src.tools.unsplash import search_unsplash_photos

        with patch.dict("os.environ", {"UNSPLASH_ACCESS_KEY": ""}):
            result = search_unsplash_photos("sunset")
        assert result == []

    def test_successful_search(self):
        from src.tools.unsplash import search_unsplash_photos

        mock_response_data = {
            "results": [
                {
                    "id": "photo1",
                    "urls": {
                        "regular": "https://images.unsplash.com/photo1",
                        "thumb": "https://images.unsplash.com/photo1?w=200",
                    },
                    "user": {
                        "name": "John Doe",
                        "links": {
                            "html": "https://unsplash.com/@johndoe",
                        },
                    },
                    "description": "A beautiful sunset",
                    "alt_description": "sunset over ocean",
                },
            ]
        }

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = MagicMock()

        with (
            patch.dict("os.environ", {"UNSPLASH_ACCESS_KEY": "test-key"}),
            patch("src.tools.unsplash.httpx.get", return_value=mock_response),
        ):
            result = search_unsplash_photos("sunset")

        assert len(result) == 1
        assert result[0]["photo_id"] == "photo1"
        assert result[0]["photographer"] == "John Doe"

    def test_handles_timeout(self):
        import httpx

        from src.tools.unsplash import search_unsplash_photos

        with (
            patch.dict("os.environ", {"UNSPLASH_ACCESS_KEY": "test-key"}),
            patch(
                "src.tools.unsplash.httpx.get",
                side_effect=httpx.TimeoutException("timeout"),
            ),
        ):
            result = search_unsplash_photos("sunset")
        assert result == []

    def test_handles_http_error(self):
        import httpx

        from src.tools.unsplash import search_unsplash_photos

        mock_response = MagicMock()
        mock_response.status_code = 403
        mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
            "Forbidden", request=MagicMock(), response=mock_response
        )

        with (
            patch.dict("os.environ", {"UNSPLASH_ACCESS_KEY": "test-key"}),
            patch("src.tools.unsplash.httpx.get", return_value=mock_response),
        ):
            result = search_unsplash_photos("sunset")
        assert result == []

    def test_per_page_parameter(self):
        from src.tools.unsplash import search_unsplash_photos

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"results": []}
        mock_response.raise_for_status = MagicMock()

        with (
            patch.dict("os.environ", {"UNSPLASH_ACCESS_KEY": "test-key"}),
            patch(
                "src.tools.unsplash.httpx.get", return_value=mock_response
            ) as mock_get,
        ):
            search_unsplash_photos("sunset", per_page=3)

        call_kwargs = mock_get.call_args
        assert call_kwargs[1]["params"]["per_page"] == 3

    def test_parses_multiple_results(self):
        from src.tools.unsplash import search_unsplash_photos

        mock_response_data = {
            "results": [
                {
                    "id": f"photo{i}",
                    "urls": {
                        "regular": f"https://images.unsplash.com/photo{i}",
                        "thumb": f"https://images.unsplash.com/photo{i}?w=200",
                    },
                    "user": {
                        "name": f"Photographer {i}",
                        "links": {
                            "html": f"https://unsplash.com/@photographer{i}",
                        },
                    },
                    "description": None,
                    "alt_description": f"photo {i}",
                }
                for i in range(3)
            ]
        }

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = MagicMock()

        with (
            patch.dict("os.environ", {"UNSPLASH_ACCESS_KEY": "test-key"}),
            patch("src.tools.unsplash.httpx.get", return_value=mock_response),
        ):
            result = search_unsplash_photos("nature", per_page=3)

        assert len(result) == 3
        assert result[0]["photo_id"] == "photo0"
        assert result[2]["photographer"] == "Photographer 2"
        assert result[1]["description"] is None
