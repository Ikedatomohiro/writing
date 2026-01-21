"""スキーマテスト"""

from datetime import UTC, datetime

from src.storage.schemas import (
    DiscoveryRecord,
    KeywordStore,
    RunInput,
    RunRecord,
    StoredKeyword,
    UsageInfo,
)


class TestUsageInfo:
    def test_default_values(self):
        usage = UsageInfo()
        assert usage.used_at is None
        assert usage.article_id is None
        assert usage.status == "unused"

    def test_with_values(self):
        now = datetime.now(UTC)
        usage = UsageInfo(
            used_at=now,
            article_id="article_123",
            status="published",
        )
        assert usage.used_at == now
        assert usage.article_id == "article_123"
        assert usage.status == "published"


class TestDiscoveryRecord:
    def test_create(self):
        now = datetime.now(UTC)
        record = DiscoveryRecord(
            discovered_at=now,
            seed_keywords=["iDeCo", "NISA"],
            source_run_id="run_abc123",
        )
        assert record.discovered_at == now
        assert record.seed_keywords == ["iDeCo", "NISA"]
        assert record.source_run_id == "run_abc123"


class TestStoredKeyword:
    def test_create_minimal(self):
        keyword = StoredKeyword(
            keyword="iDeCo 始め方",
            category="資産形成",
            relevance_score=0.85,
        )
        assert keyword.keyword == "iDeCo 始め方"
        assert keyword.category == "資産形成"
        assert keyword.search_volume is None
        assert keyword.competition == "中"
        assert keyword.relevance_score == 0.85
        assert keyword.suggested_topics == []
        assert keyword.discovery_history == []
        assert keyword.usage.status == "unused"

    def test_create_full(self):
        now = datetime.now(UTC)
        keyword = StoredKeyword(
            keyword="iDeCo 始め方",
            category="資産形成",
            search_volume=5400,
            competition="低",
            relevance_score=0.92,
            suggested_topics=["iDeCoの始め方ガイド"],
            discovery_history=[
                DiscoveryRecord(
                    discovered_at=now,
                    seed_keywords=["iDeCo"],
                    source_run_id="run_123",
                )
            ],
            usage=UsageInfo(status="in_progress"),
        )
        assert keyword.search_volume == 5400
        assert keyword.competition == "低"
        assert len(keyword.discovery_history) == 1
        assert keyword.usage.status == "in_progress"


class TestKeywordStore:
    def test_default_values(self):
        store = KeywordStore()
        assert store.version == "1.0"
        assert store.keywords == []
        assert store.runs == []

    def test_find_keyword_found(self):
        store = KeywordStore(
            keywords=[
                StoredKeyword(
                    keyword="iDeCo",
                    category="資産形成",
                    relevance_score=0.9,
                ),
                StoredKeyword(
                    keyword="NISA",
                    category="資産形成",
                    relevance_score=0.8,
                ),
            ]
        )
        result = store.find_keyword("iDeCo")
        assert result is not None
        assert result.keyword == "iDeCo"

    def test_find_keyword_not_found(self):
        store = KeywordStore()
        result = store.find_keyword("存在しない")
        assert result is None

    def test_get_unused_keywords(self):
        store = KeywordStore(
            keywords=[
                StoredKeyword(
                    keyword="iDeCo",
                    category="資産形成",
                    relevance_score=0.9,
                    usage=UsageInfo(status="unused"),
                ),
                StoredKeyword(
                    keyword="NISA",
                    category="資産形成",
                    relevance_score=0.8,
                    usage=UsageInfo(status="published"),
                ),
                StoredKeyword(
                    keyword="健康食品",
                    category="健康",
                    relevance_score=0.7,
                    usage=UsageInfo(status="unused"),
                ),
            ]
        )
        unused = store.get_unused_keywords()
        assert len(unused) == 2
        assert all(kw.usage.status == "unused" for kw in unused)

    def test_get_unused_keywords_by_category(self):
        store = KeywordStore(
            keywords=[
                StoredKeyword(
                    keyword="iDeCo",
                    category="資産形成",
                    relevance_score=0.9,
                    usage=UsageInfo(status="unused"),
                ),
                StoredKeyword(
                    keyword="健康食品",
                    category="健康",
                    relevance_score=0.7,
                    usage=UsageInfo(status="unused"),
                ),
            ]
        )
        unused = store.get_unused_keywords(category="資産形成")
        assert len(unused) == 1
        assert unused[0].keyword == "iDeCo"


class TestRunRecord:
    def test_create(self):
        now = datetime.now(UTC)
        record = RunRecord(
            run_id="run_abc123",
            executed_at=now,
            input=RunInput(
                category="資産形成",
                seed_keywords=["iDeCo"],
                depth=2,
            ),
            keywords_found=10,
            summary="テストサマリー",
        )
        assert record.run_id == "run_abc123"
        assert record.input.category == "資産形成"
        assert record.keywords_found == 10
