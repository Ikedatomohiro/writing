"""評価エージェント"""

from typing import Any

from langgraph.graph import END, StateGraph
from langgraph.graph.state import CompiledStateGraph

from src.agents.evaluator.nodes import (
    ExecutorNode,
    GoalCreatorNode,
    IntegratorNode,
    PlannerNode,
    ReflectorNode,
)
from src.agents.evaluator.schemas import (
    AgentState,
    EvaluationInput,
    EvaluationOutput,
)
from src.common import get_logger
from src.core.agents import BaseAgent
from src.core.utils import RetryConfig, create_should_continue

logger = get_logger(__name__)

# 最大リトライ回数（評価エージェント用）
MAX_EVALUATION_RETRY = 5

# フォールバック出力用のメッセージ
FALLBACK_SUMMARY = "評価の実行に失敗しました。"
FALLBACK_IMPROVEMENT = "評価を再実行してください"


class EvaluatorAgent(BaseAgent[AgentState, EvaluationInput, EvaluationOutput]):
    """評価エージェント

    BaseAgentを継承し、評価ワークフローを実行する。
    """

    def __init__(self):
        self._retry_config = RetryConfig(
            max_retries=MAX_EVALUATION_RETRY,
            continue_node="execute",
            finish_node="integrate",
        )

    def get_state_class(self) -> type[AgentState]:
        return AgentState

    def create_nodes(self) -> dict[str, Any]:
        return {
            "goal_create": GoalCreatorNode(),
            "plan": PlannerNode(),
            "execute": ExecutorNode(),
            "reflect": ReflectorNode(),
            "integrate": IntegratorNode(),
        }

    def define_graph_edges(self, graph: StateGraph[AgentState]) -> None:
        graph.set_entry_point("goal_create")
        graph.add_edge("goal_create", "plan")
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

    def create_initial_state(self, input_data: EvaluationInput) -> AgentState:
        return AgentState(
            input=input_data,
            messages=[],
            goal_output=None,
            goal=None,
            plan=None,
            tool_results=[],
            evaluation_results=[],
            reflection=None,
            retry_count=0,
            output=None,
        )

    def extract_output(self, final_state: AgentState) -> EvaluationOutput:
        output = final_state.get("output")
        if output:
            return output

        # フォールバック
        input_data = final_state["input"]
        return EvaluationOutput(
            target_summary="評価対象",
            target_type=input_data.target_type,
            overall_score=0,
            criterion_scores=[],
            strengths=[],
            weaknesses=[],
            improvements=[FALLBACK_IMPROVEMENT],
            evaluation_criteria=[],
            summary=FALLBACK_SUMMARY,
        )


# 後方互換のための関数


def should_continue(state: AgentState) -> str:
    """継続判定（後方互換のため残す）"""
    reflection = state.get("reflection")
    retry_count = state.get("retry_count", 0)

    if reflection and reflection.is_sufficient:
        return "integrate"

    if retry_count >= MAX_EVALUATION_RETRY:
        logger.warning(f"最大リトライ回数（{MAX_EVALUATION_RETRY}）に達しました")
        return "integrate"

    return "execute"


def create_goal_creator_node():
    """評価目標・基準策定ノードを作成（後方互換）"""
    return GoalCreatorNode()


def create_planner_node():
    """評価計画立案ノードを作成（後方互換）"""
    return PlannerNode()


def create_executor_node():
    """情報収集・評価実行ノードを作成（後方互換）"""
    return ExecutorNode()


def create_reflector_node():
    """評価十分性検証ノードを作成（後方互換）"""
    return ReflectorNode()


def create_integrator_node():
    """結果統合ノードを作成（後方互換）"""
    return IntegratorNode()


def create_evaluator_graph() -> CompiledStateGraph:
    """評価エージェントのグラフを作成（後方互換）"""
    agent = EvaluatorAgent()
    return agent.build_graph()


def run_evaluator(input_data: EvaluationInput) -> EvaluationOutput:
    """評価エージェントを実行

    Args:
        input_data: 評価入力

    Returns:
        評価結果
    """
    logger.info(f"評価開始: {input_data.target_type}")

    graph = create_evaluator_graph()

    initial_state: AgentState = {
        "input": input_data,
        "messages": [],
        "goal_output": None,
        "goal": None,
        "plan": None,
        "tool_results": [],
        "evaluation_results": [],
        "reflection": None,
        "retry_count": 0,
        "output": None,
    }

    result = graph.invoke(initial_state)

    output = result.get("output")
    if output:
        logger.info(f"評価完了: 総合スコア={output.overall_score}")
        return output

    # フォールバック
    return EvaluationOutput(
        target_summary="評価対象",
        target_type=input_data.target_type,
        overall_score=0,
        criterion_scores=[],
        strengths=[],
        weaknesses=[],
        improvements=[FALLBACK_IMPROVEMENT],
        evaluation_criteria=[],
        summary=FALLBACK_SUMMARY,
    )
