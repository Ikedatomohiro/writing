"""キーワード検索エージェント"""

from typing import Any

from langgraph.graph import END, StateGraph
from langgraph.graph.state import CompiledStateGraph

from src.agents.keyword_finder.nodes import (
    ExecutorNode,
    IntegratorNode,
    PlannerNode,
    ReflectorNode,
)
from src.agents.keyword_finder.schemas import (
    AgentState,
    KeywordSearchInput,
    KeywordSearchOutput,
)
from src.common import get_logger, settings
from src.core.agents import BaseAgent
from src.core.utils import RetryConfig, create_should_continue

logger = get_logger(__name__)


class KeywordFinderAgent(BaseAgent[AgentState, KeywordSearchInput, KeywordSearchOutput]):
    """キーワード検索エージェント

    BaseAgentを継承し、キーワード調査のワークフローを実行する。
    """

    def __init__(self):
        self._retry_config = RetryConfig(
            max_retries=settings.max_retry_count,
            continue_node="execute",
            finish_node="integrate",
        )

    def get_state_class(self) -> type[AgentState]:
        return AgentState

    def create_nodes(self) -> dict[str, Any]:
        return {
            "plan": PlannerNode(),
            "execute": ExecutorNode(),
            "reflect": ReflectorNode(),
            "integrate": IntegratorNode(),
        }

    def define_graph_edges(self, graph: StateGraph[AgentState]) -> None:
        graph.set_entry_point("plan")
        graph.add_edge("plan", "execute")
        graph.add_edge("execute", "reflect")
        graph.add_conditional_edges(
            "reflect",
            create_should_continue(self._retry_config),
            {
                "execute": "execute",
                "integrate": "integrate",
            },
        )
        graph.add_edge("integrate", END)

    def create_initial_state(self, input_data: KeywordSearchInput) -> AgentState:
        return AgentState(
            input=input_data,
            messages=[],
            plan=None,
            tool_results=[],
            discovered_keywords=[],
            reflection=None,
            retry_count=0,
            output=None,
        )

    def extract_output(self, final_state: AgentState) -> KeywordSearchOutput:
        output = final_state.get("output")
        if output:
            return output

        # フォールバック
        input_data = final_state["input"]
        return KeywordSearchOutput(
            category=input_data.category,
            seed_keywords=input_data.seed_keywords,
            results=[],
            summary="キーワードの検索に失敗しました。",
        )


# 後方互換のための関数


def create_planner_node():
    """計画立案ノードを作成（後方互換）"""
    return PlannerNode()


def create_executor_node():
    """ツール実行ノードを作成（後方互換）"""
    return ExecutorNode()


def create_reflector_node():
    """内省ノードを作成（後方互換）"""
    return ReflectorNode()


def create_integrator_node():
    """結果統合ノードを作成（後方互換）"""
    return IntegratorNode()


def should_continue(state: AgentState) -> str:
    """継続判定（後方互換のため残す）"""
    reflection = state.get("reflection")
    retry_count = state.get("retry_count", 0)

    if reflection and reflection.is_sufficient:
        return "integrate"

    if retry_count >= settings.max_retry_count:
        logger.warning(f"最大リトライ回数（{settings.max_retry_count}）に達しました")
        return "integrate"

    return "execute"


def create_keyword_finder_graph() -> CompiledStateGraph:
    """キーワード検索エージェントのグラフを作成（後方互換）"""
    agent = KeywordFinderAgent()
    return agent.build_graph()


def run_keyword_finder(input_data: KeywordSearchInput) -> KeywordSearchOutput:
    """キーワード検索エージェントを実行

    Args:
        input_data: 検索入力

    Returns:
        検索結果
    """
    logger.info(f"キーワード検索開始: {input_data.category}")

    graph = create_keyword_finder_graph()

    initial_state: AgentState = {
        "input": input_data,
        "messages": [],
        "plan": None,
        "tool_results": [],
        "discovered_keywords": [],
        "reflection": None,
        "retry_count": 0,
        "output": None,
    }

    result = graph.invoke(initial_state)

    output = result.get("output")
    if output:
        logger.info(f"キーワード検索完了: {len(output.results)}個のキーワード")
        return output

    # フォールバック
    return KeywordSearchOutput(
        category=input_data.category,
        seed_keywords=input_data.seed_keywords,
        results=[],
        summary="キーワードの検索に失敗しました。",
    )
