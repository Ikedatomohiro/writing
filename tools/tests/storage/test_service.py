"""サービステスト"""

from pathlib import Path
from unittest.mock import MagicMock

import pytest

from src.agents.keyword_finder.schemas.output import KeywordResult, KeywordSearchOutput
from src.storage.local import LocalFileStorage
from src.storage.schemas import KeywordStore
from src.storage.service import KeywordStorageService


@pytest.fixture
def mock_backend():
    backend = MagicMock()
    backend.load.return_value = KeywordStore()
    return backend


@pytest.fixture
def temp_storage(tmp_path: Path) -> LocalFileStorage:
    return LocalFileStorage(tmp_path / "keywords.json")


class TestKeywordStorageService:
    def test_save_search_result_new_keywords(self, temp_storage: LocalFileStorage):
        service = KeywordStorageService(temp_storage)
        result = KeywordSearchOutput(
            category="資産形成",
            seed_keywords=["iDeCo", "NISA"],
            results=[
                KeywordResult(
                    keyword="iDeCo 始め方",
                    search_volume=5000,
                    competition="中",
                    relevance_score=0.9,
                    suggested_topics=["始め方ガイド"],
                ),
                KeywordResult(
                    keyword="NISA 比較",
                    search_volume=3000,
                    competition="低",
                    relevance_score=0.85,
                    suggested_topics=["比較記事"],
                ),
            ],
            summary="テストサマリー",
        )

        run_id = service.save_search_result(result)

        assert run_id.startswith("run_")
        store = service.get_store()
        assert len(store.keywords) == 2
        assert len(store.runs) == 1
        assert store.runs[0].keywords_found == 2

    def test_save_search_result_existing_keyword(self, temp_storage: LocalFileStorage):
        # 既存のキーワードを保存
        service = KeywordStorageService(temp_storage)
        first_result = KeywordSearchOutput(
            category="資産形成",
            seed_keywords=["iDeCo"],
            results=[
                KeywordResult(
                    keyword="iDeCo 始め方",
                    relevance_score=0.7,
                    suggested_topics=["トピック1"],
                ),
            ],
            summary="1回目",
        )
        service.save_search_result(first_result)

        # 同じキーワードを再度発見
        second_result = KeywordSearchOutput(
            category="資産形成",
            seed_keywords=["年金"],
            results=[
                KeywordResult(
                    keyword="iDeCo 始め方",
                    relevance_score=0.9,  # より高いスコア
                    suggested_topics=["トピック2"],
                ),
            ],
            summary="2回目",
        )
        service.save_search_result(second_result)

        store = service.get_store()
        assert len(store.keywords) == 1  # 重複なし
        keyword = store.keywords[0]
        assert keyword.relevance_score == 0.9  # 高い方に更新
        assert len(keyword.discovery_history) == 2  # 履歴は2件
        assert set(keyword.suggested_topics) == {"トピック1", "トピック2"}

    def test_mark_keyword_used(self, temp_storage: LocalFileStorage):
        service = KeywordStorageService(temp_storage)

        # キーワードを保存
        result = KeywordSearchOutput(
            category="資産形成",
            seed_keywords=["iDeCo"],
            results=[
                KeywordResult(keyword="iDeCo 始め方", relevance_score=0.9),
            ],
            summary="テスト",
        )
        service.save_search_result(result)

        # 使用済みマーク
        success = service.mark_keyword_used(
            keyword="iDeCo 始め方",
            article_id="article_123",
            status="in_progress",
        )

        assert success is True
        store = service.get_store()
        keyword = store.find_keyword("iDeCo 始め方")
        assert keyword.usage.status == "in_progress"
        assert keyword.usage.article_id == "article_123"
        assert keyword.usage.used_at is not None

    def test_mark_keyword_used_not_found(self, temp_storage: LocalFileStorage):
        service = KeywordStorageService(temp_storage)
        success = service.mark_keyword_used(
            keyword="存在しない",
            article_id="article_123",
        )
        assert success is False

    def test_get_unused_keywords(self, temp_storage: LocalFileStorage):
        service = KeywordStorageService(temp_storage)

        # 複数キーワードを保存
        result = KeywordSearchOutput(
            category="資産形成",
            seed_keywords=["iDeCo"],
            results=[
                KeywordResult(keyword="キーワード1", relevance_score=0.9),
                KeywordResult(keyword="キーワード2", relevance_score=0.8),
            ],
            summary="テスト",
        )
        service.save_search_result(result)

        # 1つを使用済みに
        service.mark_keyword_used("キーワード1", "article_1", "published")

        # 未使用を取得
        unused = service.get_unused_keywords()
        assert len(unused) == 1
        assert unused[0].keyword == "キーワード2"

    def test_get_unused_keywords_by_category(self, temp_storage: LocalFileStorage):
        service = KeywordStorageService(temp_storage)

        # 異なるカテゴリのキーワードを保存
        result1 = KeywordSearchOutput(
            category="資産形成",
            seed_keywords=["iDeCo"],
            results=[KeywordResult(keyword="資産キーワード", relevance_score=0.9)],
            summary="",
        )
        result2 = KeywordSearchOutput(
            category="健康",
            seed_keywords=["睡眠"],
            results=[KeywordResult(keyword="健康キーワード", relevance_score=0.9)],
            summary="",
        )
        service.save_search_result(result1)
        service.save_search_result(result2)

        unused = service.get_unused_keywords(category="資産形成")
        assert len(unused) == 1
        assert unused[0].keyword == "資産キーワード"
