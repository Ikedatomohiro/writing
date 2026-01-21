"""ローカルストレージテスト"""

import json
from pathlib import Path

import pytest

from src.storage.local import LocalFileStorage
from src.storage.schemas import KeywordStore, StoredKeyword


@pytest.fixture
def temp_file(tmp_path: Path) -> Path:
    return tmp_path / "keywords.json"


class TestLocalFileStorage:
    def test_exists_false_when_no_file(self, temp_file: Path):
        storage = LocalFileStorage(temp_file)
        assert storage.exists() is False

    def test_exists_true_when_file_exists(self, temp_file: Path):
        temp_file.write_text("{}")
        storage = LocalFileStorage(temp_file)
        assert storage.exists() is True

    def test_load_returns_empty_store_when_no_file(self, temp_file: Path):
        storage = LocalFileStorage(temp_file)
        store = storage.load()
        assert isinstance(store, KeywordStore)
        assert store.keywords == []

    def test_load_returns_store_from_file(self, temp_file: Path):
        data = {
            "version": "1.0",
            "updated_at": "2024-01-21T10:00:00",
            "keywords": [
                {
                    "keyword": "iDeCo",
                    "category": "資産形成",
                    "relevance_score": 0.9,
                    "competition": "中",
                    "suggested_topics": [],
                    "discovery_history": [],
                    "usage": {"status": "unused"},
                }
            ],
            "runs": [],
        }
        temp_file.write_text(json.dumps(data, ensure_ascii=False))

        storage = LocalFileStorage(temp_file)
        store = storage.load()

        assert len(store.keywords) == 1
        assert store.keywords[0].keyword == "iDeCo"

    def test_save_creates_file(self, temp_file: Path):
        storage = LocalFileStorage(temp_file)
        store = KeywordStore(
            keywords=[
                StoredKeyword(
                    keyword="NISA",
                    category="資産形成",
                    relevance_score=0.85,
                )
            ]
        )
        storage.save(store)

        assert temp_file.exists()
        data = json.loads(temp_file.read_text())
        assert len(data["keywords"]) == 1
        assert data["keywords"][0]["keyword"] == "NISA"

    def test_save_creates_parent_dirs(self, tmp_path: Path):
        nested_file = tmp_path / "deep" / "nested" / "keywords.json"
        storage = LocalFileStorage(nested_file)
        store = KeywordStore()
        storage.save(store)

        assert nested_file.exists()

    def test_roundtrip(self, temp_file: Path):
        storage = LocalFileStorage(temp_file)

        original = KeywordStore(
            keywords=[
                StoredKeyword(
                    keyword="テスト",
                    category="テストカテゴリ",
                    search_volume=1000,
                    competition="低",
                    relevance_score=0.75,
                    suggested_topics=["トピック1", "トピック2"],
                )
            ]
        )
        storage.save(original)
        loaded = storage.load()

        assert len(loaded.keywords) == 1
        assert loaded.keywords[0].keyword == original.keywords[0].keyword
        assert loaded.keywords[0].search_volume == 1000
        assert loaded.keywords[0].suggested_topics == ["トピック1", "トピック2"]
