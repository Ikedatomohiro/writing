"""キーワード検索エージェント状態スキーマ"""

from typing import Annotated

from langgraph.graph.message import add_messages
from pydantic import BaseModel, Field
from typing_extensions import TypedDict

from src.agents.keyword_finder.schemas.input import KeywordSearchInput
from src.agents.keyword_finder.schemas.output import KeywordSearchOutput
from src.tools.web_search import SearchResult


class Plan(BaseModel):
    """実行計画"""

    subtasks: list[str] = Field(
        description="実行するサブタスクのリスト",
    )


class ToolResult(BaseModel):
    """ツール実行結果"""

    tool_name: str = Field(description="ツール名")
    query: str = Field(description="実行したクエリ")
    results: list[SearchResult] | list[str] = Field(
        description="検索結果",
    )


class ReflectionResult(BaseModel):
    """内省結果"""

    is_sufficient: bool = Field(
        description="結果が十分かどうか",
    )
    feedback: str = Field(
        description="フィードバック・改善提案",
    )
    additional_queries: list[str] = Field(
        default_factory=list,
        description="追加で検索すべきクエリ",
    )


class AgentState(TypedDict):
    """エージェント状態"""

    # 入力
    input: KeywordSearchInput

    # メッセージ履歴
    messages: Annotated[list, add_messages]

    # 計画
    plan: Plan | None

    # ツール実行結果
    tool_results: list[ToolResult]

    # 発見したキーワード
    discovered_keywords: list[str]

    # 内省結果
    reflection: ReflectionResult | None

    # リトライ回数
    retry_count: int

    # 最終出力
    output: KeywordSearchOutput | None
