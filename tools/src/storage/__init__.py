"""ストレージモジュール"""

from src.common.config import settings

from .base import StorageBackend
from .local import LocalFileStorage
from .schemas import (
    DiscoveryRecord,
    KeywordStore,
    RunInput,
    RunRecord,
    StoredKeyword,
    UsageInfo,
)
from .service import KeywordStorageService
from .vercel_blob import VercelBlobStorage


def get_storage_backend() -> StorageBackend:
    """環境に応じたストレージバックエンドを取得"""
    if settings.is_github_actions and settings.vercel_blob_token:
        return VercelBlobStorage(settings.vercel_blob_token)
    return LocalFileStorage(settings.keywords_file)


__all__ = [
    "DiscoveryRecord",
    "KeywordStore",
    "KeywordStorageService",
    "LocalFileStorage",
    "RunInput",
    "RunRecord",
    "StorageBackend",
    "StoredKeyword",
    "UsageInfo",
    "VercelBlobStorage",
    "get_storage_backend",
]
