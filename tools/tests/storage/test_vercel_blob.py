"""Vercel Blobストレージテスト"""

from unittest.mock import MagicMock, patch

import pytest

from src.storage.schemas import KeywordStore, StoredKeyword
from src.storage.vercel_blob import BLOB_API_BASE, BLOB_PATH, VercelBlobStorage


class TestVercelBlobStorageInit:
    def test_raises_error_without_token(self):
        with pytest.raises(ValueError, match="Vercel Blob token is required"):
            VercelBlobStorage("")

    def test_raises_error_with_none_token(self):
        with pytest.raises(ValueError, match="Vercel Blob token is required"):
            VercelBlobStorage(None)  # type: ignore

    def test_creates_with_valid_token(self):
        storage = VercelBlobStorage("valid_token")
        assert storage.token == "valid_token"
        assert storage._headers == {"Authorization": "Bearer valid_token"}


class TestVercelBlobStorageGetBlobUrl:
    @patch("src.storage.vercel_blob.httpx.get")
    def test_returns_url_when_blob_exists(self, mock_get: MagicMock):
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "blobs": [
                {"pathname": BLOB_PATH, "url": "https://blob.example.com/keywords.json"}
            ]
        }
        mock_get.return_value = mock_response

        storage = VercelBlobStorage("token")
        url = storage._get_blob_url()

        assert url == "https://blob.example.com/keywords.json"
        mock_get.assert_called_once()

    @patch("src.storage.vercel_blob.httpx.get")
    def test_returns_none_when_blob_not_found(self, mock_get: MagicMock):
        mock_response = MagicMock()
        mock_response.json.return_value = {"blobs": []}
        mock_get.return_value = mock_response

        storage = VercelBlobStorage("token")
        url = storage._get_blob_url()

        assert url is None

    @patch("src.storage.vercel_blob.httpx.get")
    def test_returns_none_when_different_pathname(self, mock_get: MagicMock):
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "blobs": [{"pathname": "other/path.json", "url": "https://example.com"}]
        }
        mock_get.return_value = mock_response

        storage = VercelBlobStorage("token")
        url = storage._get_blob_url()

        assert url is None


class TestVercelBlobStorageExists:
    @patch("src.storage.vercel_blob.httpx.get")
    def test_returns_true_when_blob_exists(self, mock_get: MagicMock):
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "blobs": [{"pathname": BLOB_PATH, "url": "https://example.com"}]
        }
        mock_get.return_value = mock_response

        storage = VercelBlobStorage("token")
        assert storage.exists() is True

    @patch("src.storage.vercel_blob.httpx.get")
    def test_returns_false_when_blob_not_exists(self, mock_get: MagicMock):
        mock_response = MagicMock()
        mock_response.json.return_value = {"blobs": []}
        mock_get.return_value = mock_response

        storage = VercelBlobStorage("token")
        assert storage.exists() is False


class TestVercelBlobStorageLoad:
    @patch("src.storage.vercel_blob.httpx.get")
    def test_returns_empty_store_when_not_exists(self, mock_get: MagicMock):
        mock_response = MagicMock()
        mock_response.json.return_value = {"blobs": []}
        mock_get.return_value = mock_response

        storage = VercelBlobStorage("token")
        store = storage.load()

        assert isinstance(store, KeywordStore)
        assert store.keywords == []

    @patch("src.storage.vercel_blob.httpx.get")
    def test_returns_empty_store_when_url_is_none(self, mock_get: MagicMock):
        # 1回目のcall: exists()用 - blobあり
        # 2回目のcall: _get_blob_url()用 - blobなし（タイミングで消えた場合など）
        mock_response_exists = MagicMock()
        mock_response_exists.json.return_value = {
            "blobs": [{"pathname": BLOB_PATH, "url": "https://example.com"}]
        }
        mock_response_no_url = MagicMock()
        mock_response_no_url.json.return_value = {"blobs": []}

        mock_get.side_effect = [mock_response_exists, mock_response_no_url]

        storage = VercelBlobStorage("token")
        store = storage.load()

        assert isinstance(store, KeywordStore)
        assert store.keywords == []

    @patch("src.storage.vercel_blob.httpx.get")
    def test_loads_store_from_blob(self, mock_get: MagicMock):
        blob_url = "https://blob.example.com/keywords.json"
        store_data = {
            "version": "1.0",
            "updated_at": "2024-01-21T10:00:00",
            "keywords": [
                {
                    "keyword": "テスト",
                    "category": "テスト",
                    "relevance_score": 0.9,
                    "competition": "中",
                    "suggested_topics": [],
                    "discovery_history": [],
                    "usage": {"status": "unused"},
                }
            ],
            "runs": [],
        }

        # 1回目: exists() -> _get_blob_url()
        # 2回目: load()内の _get_blob_url()
        # 3回目: 実際のデータ取得
        mock_list_response = MagicMock()
        mock_list_response.json.return_value = {
            "blobs": [{"pathname": BLOB_PATH, "url": blob_url}]
        }
        mock_data_response = MagicMock()
        mock_data_response.json.return_value = store_data

        mock_get.side_effect = [
            mock_list_response,
            mock_list_response,
            mock_data_response,
        ]

        storage = VercelBlobStorage("token")
        store = storage.load()

        assert len(store.keywords) == 1
        assert store.keywords[0].keyword == "テスト"


class TestVercelBlobStorageSave:
    @patch("src.storage.vercel_blob.httpx.put")
    def test_saves_store_to_blob(self, mock_put: MagicMock):
        mock_response = MagicMock()
        mock_response.raise_for_status = MagicMock()
        mock_put.return_value = mock_response

        storage = VercelBlobStorage("token")
        store = KeywordStore(
            keywords=[
                StoredKeyword(
                    keyword="保存テスト",
                    category="テスト",
                    relevance_score=0.8,
                )
            ]
        )
        storage.save(store)

        mock_put.assert_called_once()
        call_args = mock_put.call_args
        assert call_args[0][0] == f"{BLOB_API_BASE}/{BLOB_PATH}"
        assert "Authorization" in call_args[1]["headers"]
        assert call_args[1]["headers"]["Content-Type"] == "application/json"
