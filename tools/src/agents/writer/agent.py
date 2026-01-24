"""Writer agent."""

from typing import Any

from langgraph.graph import END, StateGraph
from langgraph.graph.state import CompiledStateGraph

from src.agents.writer.nodes import (
    ExecutorNode,
    IntegratorNode,
    PlannerNode,
    ReflectorNode,
)
from src.agents.writer.schemas import (
    AgentState,
    WriterInput,
    WriterOutput,
)
from src.common import get_logger
from src.core.agents import BaseAgent
from src.core.utils import RetryConfig, create_should_continue

logger = get_logger(__name__)

# 最大リトライ回数
MAX_WRITER_RETRY = 3

# フォールバック出力用のメッセージ
FALLBACK_SUMMARY = "記事の生成に失敗しました。"


class WriterAgent(BaseAgent[AgentState, WriterInput, WriterOutput]):
    """記事生成エージェント

    BaseAgentを継承し、記事生成ワークフローを実行する。
    """

    def __init__(self):
        self._retry_config = RetryConfig(
            max_retries=MAX_WRITER_RETRY,
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

    def create_initial_state(self, input_data: WriterInput) -> AgentState:
        return AgentState(
            input=input_data,
            messages=[],
            plan=None,
            sections=[],
            reflection=None,
            retry_count=0,
            output=None,
        )

    def extract_output(self, final_state: AgentState) -> WriterOutput:
        output = final_state.get("output")
        if output:
            return output

        # フォールバック
        input_data = final_state["input"]
        return WriterOutput(
            title=input_data.topic,
            description="",
            content="",
            keywords_used=[],
            sections=[],
            summary=FALLBACK_SUMMARY,
        )


# 後方互換のための関数


def should_continue(state: AgentState) -> str:
    """継続判定（後方互換のため残す）"""
    reflection = state.get("reflection")
    retry_count = state.get("retry_count", 0)

    if reflection and reflection.is_sufficient:
        return "integrate"

    if retry_count >= MAX_WRITER_RETRY:
        logger.warning(f"最大リトライ回数（{MAX_WRITER_RETRY}）に達しました")
        return "integrate"

    return "execute"


def create_planner_node():
    """計画立案ノードを作成（後方互換）"""
    return PlannerNode()


def create_executor_node():
    """セクション執筆ノードを作成（後方互換）"""
    return ExecutorNode()


def create_reflector_node():
    """品質チェックノードを作成（後方互換）"""
    return ReflectorNode()


def create_integrator_node():
    """結果統合ノードを作成（後方互換）"""
    return IntegratorNode()


def create_writer_graph() -> CompiledStateGraph:
    """記事生成エージェントのグラフを作成（後方互換）"""
    agent = WriterAgent()
    return agent.build_graph()


def run_writer(input_data: WriterInput) -> WriterOutput:
    """記事生成エージェントを実行

    Args:
        input_data: 生成入力

    Returns:
        生成結果
    """
    logger.info(f"記事生成開始: {input_data.topic}")

    graph = create_writer_graph()

    initial_state: AgentState = {
        "input": input_data,
        "messages": [],
        "plan": None,
        "sections": [],
        "reflection": None,
        "retry_count": 0,
        "output": None,
    }

    result = graph.invoke(initial_state)

    output = result.get("output")
    if output:
        logger.info(f"記事生成完了: {output.title}")
        return output

    # フォールバック
    return WriterOutput(
        title=input_data.topic,
        description="",
        content="",
        keywords_used=[],
        sections=[],
        summary=FALLBACK_SUMMARY,
    )
