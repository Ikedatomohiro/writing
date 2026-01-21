"""ローカルファイルストレージ"""

import json
from pathlib import Path

from .schemas import KeywordStore


class LocalFileStorage:
    """ローカルファイルシステムへの保存"""

    def __init__(self, file_path: Path) -> None:
        self.file_path = file_path

    def load(self) -> KeywordStore:
        """ストアを読み込む"""
        if not self.exists():
            return KeywordStore()

        with self.file_path.open("r", encoding="utf-8") as f:
            data = json.load(f)

        return KeywordStore.model_validate(data)

    def save(self, store: KeywordStore) -> None:
        """ストアを保存する"""
        self.file_path.parent.mkdir(parents=True, exist_ok=True)

        with self.file_path.open("w", encoding="utf-8") as f:
            json.dump(
                store.model_dump(mode="json"),
                f,
                ensure_ascii=False,
                indent=2,
            )

    def exists(self) -> bool:
        """ストアが存在するか確認"""
        return self.file_path.exists()
