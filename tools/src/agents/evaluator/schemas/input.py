"""評価エージェント入力スキーマ"""

from typing import Literal

from pydantic import BaseModel, Field


class EvaluationInput(BaseModel):
    """評価の入力"""

    target: str = Field(
        description="評価対象（テキスト or URL）",
    )
    target_type: Literal["article", "service", "product", "other"] = Field(
        default="article",
        description="評価対象の種類",
    )
    evaluation_request: str = Field(
        description="評価してほしい内容の説明",
    )
    context: str | None = Field(
        default=None,
        description="追加コンテキスト（任意）",
    )
