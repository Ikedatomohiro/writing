"""キーワードストレージのスキーマ定義"""

from datetime import UTC, datetime
from typing import Literal

from pydantic import BaseModel, Field


class DiscoveryRecord(BaseModel):
    """キーワード発見履歴"""

    discovered_at: datetime = Field(description="発見日時")
    seed_keywords: list[str] = Field(description="使用したシードキーワード")
    source_run_id: str = Field(description="実行ID")


class UsageInfo(BaseModel):
    """キーワード使用情報"""

    used_at: datetime | None = Field(default=None, description="使用日時")
    article_id: str | None = Field(default=None, description="記事ID")
    status: Literal["unused", "in_progress", "published"] = Field(
        default="unused",
        description="使用状況",
    )


class StoredKeyword(BaseModel):
    """保存されるキーワード"""

    keyword: str = Field(description="キーワード")
    category: str = Field(description="カテゴリ")
    search_volume: int | None = Field(default=None, description="検索ボリューム")
    competition: Literal["低", "中", "高"] = Field(
        default="中",
        description="競合度",
    )
    relevance_score: float = Field(
        ge=0.0,
        le=1.0,
        description="関連度スコア",
    )
    suggested_topics: list[str] = Field(
        default_factory=list,
        description="記事トピック案",
    )
    discovery_history: list[DiscoveryRecord] = Field(
        default_factory=list,
        description="発見履歴",
    )
    usage: UsageInfo = Field(
        default_factory=UsageInfo,
        description="使用情報",
    )


class RunInput(BaseModel):
    """実行入力"""

    category: str = Field(description="カテゴリ")
    seed_keywords: list[str] = Field(description="シードキーワード")
    depth: int = Field(description="探索深度")


class RunRecord(BaseModel):
    """実行履歴"""

    run_id: str = Field(description="実行ID")
    executed_at: datetime = Field(description="実行日時")
    input: RunInput = Field(description="入力パラメータ")
    keywords_found: int = Field(description="発見キーワード数")
    summary: str = Field(default="", description="実行サマリー")


class KeywordStore(BaseModel):
    """キーワードストア全体"""

    version: str = Field(default="1.0", description="スキーマバージョン")
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        description="最終更新日時",
    )
    keywords: list[StoredKeyword] = Field(
        default_factory=list,
        description="キーワードリスト",
    )
    runs: list[RunRecord] = Field(
        default_factory=list,
        description="実行履歴",
    )

    def find_keyword(self, keyword: str) -> StoredKeyword | None:
        """キーワードを検索"""
        for kw in self.keywords:
            if kw.keyword == keyword:
                return kw
        return None

    def get_unused_keywords(self, category: str | None = None) -> list[StoredKeyword]:
        """未使用キーワードを取得"""
        unused = [kw for kw in self.keywords if kw.usage.status == "unused"]
        if category:
            unused = [kw for kw in unused if kw.category == category]
        return unused
