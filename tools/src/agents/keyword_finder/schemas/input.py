"""キーワード検索エージェント入力スキーマ"""

from typing import Literal

from pydantic import BaseModel, Field


class KeywordSearchInput(BaseModel):
    """キーワード検索の入力"""

    category: Literal["資産形成", "健康", "エンジニア"] = Field(
        description="検索対象の分野"
    )
    seed_keywords: list[str] = Field(
        description="シードキーワードのリスト",
        min_length=1,
    )
    depth: int = Field(
        default=2,
        ge=1,
        le=3,
        description="深掘りレベル（1-3）",
    )
