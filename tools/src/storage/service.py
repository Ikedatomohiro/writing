"""キーワードストレージサービス"""

import uuid
from datetime import UTC, datetime

from src.agents.keyword_finder.schemas.output import KeywordSearchOutput

from .base import StorageBackend
from .schemas import (
    DiscoveryRecord,
    KeywordStore,
    RunInput,
    RunRecord,
    StoredKeyword,
    UsageInfo,
)


class KeywordStorageService:
    """キーワードストレージのビジネスロジック"""

    def __init__(self, backend: StorageBackend) -> None:
        self.backend = backend

    def save_search_result(self, result: KeywordSearchOutput) -> str:
        """検索結果を保存し、実行IDを返す"""
        store = self.backend.load()
        run_id = f"run_{uuid.uuid4().hex[:12]}"
        now = datetime.now(UTC)

        # 各キーワードを保存
        for kw_result in result.results:
            existing = store.find_keyword(kw_result.keyword)

            discovery = DiscoveryRecord(
                discovered_at=now,
                seed_keywords=result.seed_keywords,
                source_run_id=run_id,
            )

            if existing:
                # 既存キーワードに発見履歴を追加
                existing.discovery_history.append(discovery)
                # より高い関連度スコアがあれば更新
                if kw_result.relevance_score > existing.relevance_score:
                    existing.relevance_score = kw_result.relevance_score
                # トピック案をマージ
                existing.suggested_topics = list(
                    set(existing.suggested_topics + kw_result.suggested_topics)
                )
            else:
                # 新規キーワードを追加
                stored = StoredKeyword(
                    keyword=kw_result.keyword,
                    category=result.category,
                    search_volume=kw_result.search_volume,
                    competition=kw_result.competition,
                    relevance_score=kw_result.relevance_score,
                    suggested_topics=kw_result.suggested_topics,
                    discovery_history=[discovery],
                    usage=UsageInfo(),
                )
                store.keywords.append(stored)

        # 実行履歴を追加
        run_record = RunRecord(
            run_id=run_id,
            executed_at=now,
            input=RunInput(
                category=result.category,
                seed_keywords=result.seed_keywords,
                depth=2,  # デフォルト値
            ),
            keywords_found=len(result.results),
            summary=result.summary,
        )
        store.runs.append(run_record)
        store.updated_at = now

        self.backend.save(store)
        return run_id

    def mark_keyword_used(
        self,
        keyword: str,
        article_id: str,
        status: str = "in_progress",
    ) -> bool:
        """キーワードを使用済みとしてマーク"""
        store = self.backend.load()
        existing = store.find_keyword(keyword)

        if not existing:
            return False

        existing.usage.used_at = datetime.now(UTC)
        existing.usage.article_id = article_id
        existing.usage.status = status  # type: ignore
        store.updated_at = datetime.now(UTC)

        self.backend.save(store)
        return True

    def get_unused_keywords(
        self,
        category: str | None = None,
    ) -> list[StoredKeyword]:
        """未使用キーワードを取得"""
        store = self.backend.load()
        return store.get_unused_keywords(category)

    def get_store(self) -> KeywordStore:
        """ストア全体を取得"""
        return self.backend.load()
