"""Vercel Blobストレージ"""

import httpx

from .schemas import KeywordStore

BLOB_API_BASE = "https://blob.vercel-storage.com"
BLOB_PATH = "keywords/keywords.json"


class VercelBlobStorage:
    """Vercel Blob APIへの保存"""

    def __init__(self, token: str) -> None:
        if not token:
            raise ValueError("Vercel Blob token is required")
        self.token = token
        self._headers = {"Authorization": f"Bearer {token}"}

    def load(self) -> KeywordStore:
        """ストアを読み込む"""
        if not self.exists():
            return KeywordStore()

        url = self._get_blob_url()
        if not url:
            return KeywordStore()

        response = httpx.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()

        return KeywordStore.model_validate(data)

    def save(self, store: KeywordStore) -> None:
        """ストアを保存する"""
        json_content = store.model_dump_json(indent=2)

        response = httpx.put(
            f"{BLOB_API_BASE}/{BLOB_PATH}",
            content=json_content.encode("utf-8"),
            headers={
                **self._headers,
                "Content-Type": "application/json",
                "x-api-version": "7",
            },
            timeout=30,
        )
        response.raise_for_status()

    def exists(self) -> bool:
        """ストアが存在するか確認"""
        return self._get_blob_url() is not None

    def _get_blob_url(self) -> str | None:
        """Blob URLを取得"""
        response = httpx.get(
            f"{BLOB_API_BASE}",
            headers={**self._headers, "x-api-version": "7"},
            params={"prefix": "keywords/"},
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()

        blobs = data.get("blobs", [])
        for blob in blobs:
            if blob.get("pathname") == BLOB_PATH:
                return blob.get("url")

        return None
