"""キーワード検索エージェント出力スキーマ"""

from typing import Literal

from pydantic import BaseModel, Field


class KeywordResult(BaseModel):
    """キーワード検索結果"""

    keyword: str = Field(description="キーワード")
    search_volume: int | None = Field(
        default=None,
        description="検索ボリューム（推定）",
    )
    competition: Literal["低", "中", "高"] = Field(
        default="中",
        description="競合度",
    )
    relevance_score: float = Field(
        ge=0.0,
        le=1.0,
        description="関連度スコア（0-1）",
    )
    suggested_topics: list[str] = Field(
        default_factory=list,
        description="記事トピック案",
    )


class KeywordSearchOutput(BaseModel):
    """キーワード検索の最終出力"""

    category: str = Field(description="検索した分野")
    seed_keywords: list[str] = Field(description="使用したシードキーワード")
    results: list[KeywordResult] = Field(
        default_factory=list,
        description="検索結果のリスト",
    )
    summary: str = Field(
        default="",
        description="分析サマリー",
    )
