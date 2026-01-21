"""ストレージモジュール初期化テスト"""

from unittest.mock import patch

from src.storage import LocalFileStorage, VercelBlobStorage, get_storage_backend


class TestGetStorageBackend:
    @patch("src.storage.settings")
    def test_returns_local_storage_by_default(self, mock_settings):
        mock_settings.is_github_actions = False
        mock_settings.vercel_blob_token = ""
        mock_settings.keywords_file = "/tmp/keywords.json"

        backend = get_storage_backend()

        assert isinstance(backend, LocalFileStorage)

    @patch("src.storage.settings")
    def test_returns_local_storage_when_no_token(self, mock_settings):
        mock_settings.is_github_actions = True
        mock_settings.vercel_blob_token = ""
        mock_settings.keywords_file = "/tmp/keywords.json"

        backend = get_storage_backend()

        assert isinstance(backend, LocalFileStorage)

    @patch("src.storage.settings")
    def test_returns_vercel_blob_storage_in_github_actions(self, mock_settings):
        mock_settings.is_github_actions = True
        mock_settings.vercel_blob_token = "valid_token"

        backend = get_storage_backend()

        assert isinstance(backend, VercelBlobStorage)
        assert backend.token == "valid_token"
