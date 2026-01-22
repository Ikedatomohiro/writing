"""評価エージェント状態スキーマ"""

from typing import Annotated

from langgraph.graph.message import add_messages
from pydantic import BaseModel, Field
from typing_extensions import TypedDict

from src.agents.evaluator.schemas.input import EvaluationInput
from src.agents.evaluator.schemas.output import (
    EvaluationOutput,
    GoalCreatorOutput,
)
from src.tools.web_search import SearchResult


class EvaluationGoal(BaseModel):
    """評価目標"""

    goal: str = Field(description="評価目標")
    criteria: list[str] = Field(
        default_factory=list,
        description="評価基準のリスト",
    )
    target_type: str = Field(description="評価対象の種類")


class EvaluationPlan(BaseModel):
    """評価計画"""

    steps: list[str] = Field(
        description="評価ステップのリスト",
    )
    required_research: list[str] = Field(
        default_factory=list,
        description="必要な調査項目",
    )


class ToolResult(BaseModel):
    """ツール実行結果"""

    tool_name: str = Field(description="ツール名")
    query: str = Field(description="実行したクエリ")
    research_item: str = Field(
        default="",
        description="元の調査項目（重複チェック用）",
    )
    results: list[SearchResult] | list[str] = Field(
        description="検索結果",
    )


class EvaluationResult(BaseModel):
    """評価結果（中間）"""

    criterion: str = Field(description="評価基準")
    score: int = Field(
        ge=0,
        le=100,
        description="スコア（0-100）",
    )
    rationale: str = Field(description="根拠")
    evidence: list[str] = Field(
        default_factory=list,
        description="裏付け情報",
    )


class ReflectionResult(BaseModel):
    """内省結果"""

    is_sufficient: bool = Field(
        description="評価が十分かどうか",
    )
    feedback: str = Field(
        description="フィードバック・改善提案",
    )
    missing_criteria: list[str] = Field(
        default_factory=list,
        description="不足している評価基準",
    )
    additional_research: list[str] = Field(
        default_factory=list,
        description="追加で調査すべき項目",
    )


class AgentState(TypedDict):
    """エージェント状態"""

    # 入力
    input: EvaluationInput

    # メッセージ履歴
    messages: Annotated[list, add_messages]

    # GoalCreator出力
    goal_output: GoalCreatorOutput | None

    # 評価目標
    goal: EvaluationGoal | None

    # 評価計画
    plan: EvaluationPlan | None

    # ツール実行結果
    tool_results: list[ToolResult]

    # 評価結果（中間）
    evaluation_results: list[EvaluationResult]

    # 内省結果
    reflection: ReflectionResult | None

    # リトライ回数
    retry_count: int

    # 最終出力
    output: EvaluationOutput | None
