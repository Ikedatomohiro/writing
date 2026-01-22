"""評価エージェント出力スキーマ"""

from pydantic import BaseModel, Field


class CriterionScore(BaseModel):
    """評価基準ごとのスコア"""

    criterion: str = Field(description="評価基準名")
    score: int = Field(
        ge=0,
        le=100,
        description="スコア（0-100）",
    )
    rationale: str = Field(description="スコアの根拠")


class EvaluationOutput(BaseModel):
    """評価の最終出力"""

    target_summary: str = Field(description="評価対象の要約")
    target_type: str = Field(description="評価対象の種類")
    overall_score: int = Field(
        ge=0,
        le=100,
        description="総合スコア（0-100）",
    )
    criterion_scores: list[CriterionScore] = Field(
        default_factory=list,
        description="評価基準ごとのスコア",
    )
    strengths: list[str] = Field(
        default_factory=list,
        description="長所リスト",
    )
    weaknesses: list[str] = Field(
        default_factory=list,
        description="短所リスト",
    )
    improvements: list[str] = Field(
        default_factory=list,
        description="改善点リスト",
    )
    evaluation_criteria: list[str] = Field(
        default_factory=list,
        description="使用した評価基準",
    )
    summary: str = Field(
        default="",
        description="評価サマリー",
    )


class ClarificationQuestion(BaseModel):
    """依頼者への確認質問"""

    question: str = Field(description="質問内容")
    options: list[str] | None = Field(
        default=None,
        description="選択肢（あれば）",
    )
    purpose: str = Field(description="この質問の目的")


class GoalCreatorOutput(BaseModel):
    """GoalCreatorの出力"""

    evaluation_goal: str = Field(description="明確化された評価目標")
    evaluation_criteria: list[str] = Field(
        default_factory=list,
        description="評価基準のリスト",
    )
    questions: list[ClarificationQuestion] = Field(
        default_factory=list,
        description="依頼者への質問（必要な場合）",
    )
    needs_clarification: bool = Field(
        default=False,
        description="質問が必要かどうか",
    )
