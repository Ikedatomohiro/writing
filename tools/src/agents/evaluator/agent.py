"""評価エージェント"""

from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import END, StateGraph

from src.agents.evaluator.prompts import (
    EXECUTOR_SYSTEM_PROMPT,
    GOAL_CREATOR_SYSTEM_PROMPT,
    GOAL_CREATOR_USER_PROMPT,
    INTEGRATOR_SYSTEM_PROMPT,
    INTEGRATOR_USER_PROMPT,
    PLANNER_SYSTEM_PROMPT,
    PLANNER_USER_PROMPT,
    REFLECTOR_SYSTEM_PROMPT,
    REFLECTOR_USER_PROMPT,
)
from src.agents.evaluator.schemas import (
    AgentState,
    EvaluationGoal,
    EvaluationInput,
    EvaluationOutput,
    EvaluationPlan,
    EvaluationResult,
    GoalCreatorOutput,
    ReflectionResult,
    ToolResult,
)
from src.common import get_logger
from src.models import get_chat_model, get_structured_model
from src.tools import search_web

logger = get_logger(__name__)

# 利用可能なツール
TOOLS = [search_web]

# 最大リトライ回数（評価エージェント用）
MAX_EVALUATION_RETRY = 5


def create_goal_creator_node():
    """評価目標・基準策定ノードを作成（プロアクティブゴールクリエイター）"""

    def goal_creator(state: AgentState) -> dict:
        logger.info("評価目標・基準策定を開始")

        input_data = state["input"]
        model = get_structured_model(GoalCreatorOutput)

        messages = [
            SystemMessage(content=GOAL_CREATOR_SYSTEM_PROMPT),
            HumanMessage(
                content=GOAL_CREATOR_USER_PROMPT.format(
                    target=input_data.target[:500],  # 長すぎる場合は切り詰め
                    target_type=input_data.target_type,
                    evaluation_request=input_data.evaluation_request,
                    context=input_data.context or "なし",
                )
            ),
        ]

        goal_output = model.invoke(messages)
        logger.info(
            f"評価目標策定完了: {len(goal_output.evaluation_criteria)}個の評価基準"
        )

        # GoalCreatorOutputからEvaluationGoalを生成
        goal = EvaluationGoal(
            goal=goal_output.evaluation_goal,
            criteria=goal_output.evaluation_criteria,
            target_type=input_data.target_type,
        )

        return {
            "goal_output": goal_output,
            "goal": goal,
            "messages": messages,
        }

    return goal_creator


def create_planner_node():
    """評価計画立案ノードを作成"""

    def planner(state: AgentState) -> dict:
        logger.info("評価計画立案を開始")

        input_data = state["input"]
        goal = state["goal"]

        if not goal:
            logger.warning("評価目標が設定されていません")
            return {}

        model = get_structured_model(EvaluationPlan)

        messages = [
            SystemMessage(content=PLANNER_SYSTEM_PROMPT),
            HumanMessage(
                content=PLANNER_USER_PROMPT.format(
                    evaluation_goal=goal.goal,
                    evaluation_criteria="\n".join(
                        f"- {c}" for c in goal.criteria
                    ),
                    target=input_data.target[:500],
                    target_type=input_data.target_type,
                )
            ),
        ]

        plan = model.invoke(messages)
        logger.info(f"評価計画立案完了: {len(plan.steps)}個のステップ")

        return {"plan": plan}

    return planner


def create_executor_node():
    """情報収集・評価実行ノードを作成"""

    def executor(state: AgentState) -> dict:
        logger.info("情報収集・評価実行を開始")

        input_data = state["input"]
        goal = state["goal"]
        plan = state["plan"]

        if not plan or not goal:
            return {}

        tool_results = list(state.get("tool_results", []))
        evaluation_results = list(state.get("evaluation_results", []))

        model_with_tools = get_chat_model().bind_tools(TOOLS)
        eval_model = get_structured_model(EvaluationResult)

        # 必要な調査を実行
        for research_item in plan.required_research:
            # 調査項目ベースで重複チェック
            if any(r.research_item == research_item for r in tool_results):
                logger.info(f"調査スキップ（実行済み）: {research_item}")
                continue

            logger.info(f"調査実行: {research_item}")

            messages = [
                SystemMessage(content="以下のトピックについてWeb検索を実行してください。"),
                HumanMessage(content=research_item),
            ]

            response = model_with_tools.invoke(messages)

            if response.tool_calls:
                for tool_call in response.tool_calls:
                    tool_name = tool_call["name"]
                    tool_args = tool_call["args"]

                    logger.info(f"ツール呼び出し: {tool_name}({tool_args})")

                    if tool_name == "search_web":
                        results = search_web.invoke(tool_args)
                        tool_results.append(
                            ToolResult(
                                tool_name=tool_name,
                                query=tool_args.get("query", research_item),
                                research_item=research_item,
                                results=results,
                            )
                        )

        # 各評価基準に対して評価を実行
        for criterion in goal.criteria:
            # 既に評価済みの基準はスキップ
            if any(r.criterion == criterion for r in evaluation_results):
                continue

            logger.info(f"評価基準を評価: {criterion}")

            # 関連するツール結果を収集
            relevant_info = []
            for tr in tool_results:
                for result in tr.results[:3]:
                    if hasattr(result, "snippet"):
                        relevant_info.append(f"- {result.title}: {result.snippet}")

            eval_messages = [
                SystemMessage(content=EXECUTOR_SYSTEM_PROMPT),
                HumanMessage(
                    content=f"""# 評価対象
{input_data.target[:1000]}

# 評価基準
{criterion}

# 参考情報
{chr(10).join(relevant_info[:10]) or "なし"}

上記の評価基準に基づいて評価してください。"""
                ),
            ]

            result = eval_model.invoke(eval_messages)
            # 基準名を設定
            result.criterion = criterion
            evaluation_results.append(result)

        logger.info(
            f"評価実行完了: {len(tool_results)}回調査, "
            f"{len(evaluation_results)}個の基準を評価"
        )

        return {
            "tool_results": tool_results,
            "evaluation_results": evaluation_results,
        }

    return executor


def create_reflector_node():
    """評価十分性検証ノードを作成"""

    def reflector(state: AgentState) -> dict:
        logger.info("評価十分性検証を開始")

        goal = state["goal"]
        evaluation_results = state.get("evaluation_results", [])
        tool_results = state.get("tool_results", [])

        if not goal:
            return {}

        # コード側での十分性チェック
        # すべての評価基準が評価されていれば十分と判定
        evaluated_criteria = {r.criterion for r in evaluation_results}
        required_criteria = set(goal.criteria)
        missing_criteria = required_criteria - evaluated_criteria

        if not missing_criteria:
            # すべての基準が評価済み → 十分と判定
            logger.info("すべての評価基準が評価済み → 十分と判定")
            reflection = ReflectionResult(
                is_sufficient=True,
                feedback="すべての評価基準に対してスコアと根拠が提供されています。",
                missing_criteria=[],
                additional_research=[],
            )
            return {
                "reflection": reflection,
                "retry_count": state.get("retry_count", 0) + 1,
            }

        # 未評価の基準がある場合はLLMに判定を委ねる
        # ツール結果のサマリーを作成
        tool_summary = "\n".join(
            f"- {r.tool_name}: {r.query} → {len(r.results)}件"
            for r in tool_results
        )

        # 評価結果のサマリーを作成
        eval_summary = "\n".join(
            f"- {r.criterion}: {r.score}点 - {r.rationale[:100]}"
            for r in evaluation_results
        )

        model = get_structured_model(ReflectionResult)

        messages = [
            SystemMessage(content=REFLECTOR_SYSTEM_PROMPT),
            HumanMessage(
                content=REFLECTOR_USER_PROMPT.format(
                    evaluation_goal=goal.goal,
                    evaluation_criteria="\n".join(f"- {c}" for c in goal.criteria),
                    evaluation_results=eval_summary or "なし",
                    tool_results_summary=tool_summary or "なし",
                )
            ),
        ]

        reflection = model.invoke(messages)
        logger.info(f"評価検証完了: 十分={reflection.is_sufficient}")

        return {
            "reflection": reflection,
            "retry_count": state.get("retry_count", 0) + 1,
        }

    return reflector


def create_integrator_node():
    """結果統合ノードを作成"""

    def integrator(state: AgentState) -> dict:
        logger.info("結果統合を開始")

        input_data = state["input"]
        goal = state["goal"]
        evaluation_results = state.get("evaluation_results", [])
        tool_results = state.get("tool_results", [])

        if not goal:
            return {}

        # 評価結果のサマリー
        eval_summary = "\n".join(
            f"- {r.criterion}: {r.score}点\n  根拠: {r.rationale}"
            for r in evaluation_results
        )

        # 収集した情報のサマリー
        collected_info = []
        for tr in tool_results:
            for result in tr.results[:3]:
                if hasattr(result, "snippet"):
                    collected_info.append(f"- {result.title}: {result.snippet}")

        model = get_structured_model(EvaluationOutput)

        messages = [
            SystemMessage(content=INTEGRATOR_SYSTEM_PROMPT),
            HumanMessage(
                content=INTEGRATOR_USER_PROMPT.format(
                    target=input_data.target[:500],
                    target_type=input_data.target_type,
                    evaluation_goal=goal.goal,
                    evaluation_criteria="\n".join(f"- {c}" for c in goal.criteria),
                    evaluation_results=eval_summary or "なし",
                    collected_information="\n".join(collected_info[:15]) or "なし",
                )
            ),
        ]

        output = model.invoke(messages)
        logger.info(f"結果統合完了: 総合スコア={output.overall_score}")

        return {"output": output}

    return integrator


def should_continue(state: AgentState) -> str:
    """継続判定"""
    reflection = state.get("reflection")
    retry_count = state.get("retry_count", 0)

    if reflection and reflection.is_sufficient:
        return "integrate"

    if retry_count >= MAX_EVALUATION_RETRY:
        logger.warning(f"最大リトライ回数（{MAX_EVALUATION_RETRY}）に達しました")
        return "integrate"

    return "execute"


def create_evaluator_graph() -> StateGraph:
    """評価エージェントのグラフを作成"""

    # グラフを構築
    graph = StateGraph(AgentState)

    # ノードを追加
    graph.add_node("goal_create", create_goal_creator_node())
    graph.add_node("plan", create_planner_node())
    graph.add_node("execute", create_executor_node())
    graph.add_node("reflect", create_reflector_node())
    graph.add_node("integrate", create_integrator_node())

    # エッジを追加
    graph.set_entry_point("goal_create")
    graph.add_edge("goal_create", "plan")
    graph.add_edge("plan", "execute")
    graph.add_edge("execute", "reflect")
    graph.add_conditional_edges(
        "reflect",
        should_continue,
        {
            "execute": "execute",
            "integrate": "integrate",
        },
    )
    graph.add_edge("integrate", END)

    return graph.compile()


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
        improvements=["評価を再実行してください"],
        evaluation_criteria=[],
        summary="評価の実行に失敗しました。",
    )
