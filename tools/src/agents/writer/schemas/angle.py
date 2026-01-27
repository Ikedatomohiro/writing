"""切り口提案関連のスキーマ定義."""

from pydantic import BaseModel, Field, field_validator


class AngleProposal(BaseModel):
    """切り口提案の1件.

    記事の切り口（アングル）を表現するスキーマ。
    タイトル、概要、想定読者、差別化ポイントを含む。
    """

    title: str = Field(description="記事タイトル案")
    summary: str = Field(description="記事の概要・方向性")
    target_audience: str = Field(description="想定読者層")
    differentiator: str = Field(description="他記事との差別化ポイント")

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        """タイトルは空文字不可."""
        if not v or not v.strip():
            raise ValueError("title must not be empty")
        return v


class AngleProposalList(BaseModel):
    """切り口提案のリスト.

    通常3件の切り口を含む。最低1件、最大5件まで。
    """

    proposals: list[AngleProposal] = Field(
        description="切り口提案リスト（3件推奨）",
        min_length=1,
        max_length=5,
    )
    reasoning: str = Field(description="提案の根拠・理由")


class AngleSelection(BaseModel):
    """切り口の選択結果.

    ユーザーが選択した場合と自動選択の場合がある。
    """

    selected_index: int = Field(
        description="選択された切り口のインデックス（0始まり）",
        ge=0,
    )
    reason: str = Field(description="選択理由")
    auto_selected: bool = Field(
        default=False,
        description="自動選択されたかどうか",
    )
