"""ストレージバックエンドの抽象化"""

from abc import abstractmethod
from typing import Protocol

from .schemas import KeywordStore


class StorageBackend(Protocol):
    """ストレージバックエンドのプロトコル"""

    @abstractmethod
    def load(self) -> KeywordStore:
        """ストアを読み込む"""
        ...

    @abstractmethod
    def save(self, store: KeywordStore) -> None:
        """ストアを保存する"""
        ...

    @abstractmethod
    def exists(self) -> bool:
        """ストアが存在するか確認"""
        ...
