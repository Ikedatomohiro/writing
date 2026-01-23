"""評価エージェントノード

BaseNode を継承したノードクラスの定義。
"""

from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage

from src.agents.evaluator.prompts import (
    EXECUTOR_SYSTEM_PROMPT,
    GOAL_CREATOR_PROMPT_CONFIG,
    INTEGRATOR_PROMPT_CONFIG,
    PLANNER_PROMPT_CONFIG,
    REFLECTOR_PROMPT_CONFIG,
)
from src.agents.evaluator.schemas import (
    AgentState,
    EvaluationGoal,
    EvaluationOutput,
    EvaluationPlan,
    EvaluationResult,
    GoalCreatorOutput,
    ReflectionResult,
    ToolResult,
)
from src.common import get_logger
from src.core.nodes import BaseNode
from src.models import get_chat_model, get_structured_model
from src.tools import SearchResult, search_web

logger = get_logger(__name__)

# 利用可能なツール
TOOLS = [search_web]


class GoalCreatorNode(BaseNode[AgentState, GoalCreatorOutput]):
    """評価目標・基準策定ノード（プロアクティブゴールクリエイター）"""

    def __init__(self):
        super().__init__(
            prompt_config=GOAL_CREATOR_PROMPT_CONFIG,
            output_schema=GoalCreatorOutput,
        )

    def extract_prompt_variables(self, state: AgentState) -> dict[str, Any]:
        input_data = state["input"]
        return {
            "target": input_data.target[:500],
            "target_type": input_data.target_type,
            "evaluation_request": input_data.evaluation_request,
            "context": input_data.context or "なし",
        }

    def update_state(
        self, state: AgentState, output: GoalCreatorOutput
    ) -> dict[str, Any]:
        logger.info(f"評価目標策定完了: {len(output.evaluation_criteria)}個の評価基準")

        input_data = state["input"]
        goal = EvaluationGoal(
            goal=output.evaluation_goal,
            criteria=output.evaluation_criteria,
            target_type=input_data.target_type,
        )

        return {
            "goal_output": output,
            "goal": goal,
            "messages": [
                SystemMessage(content=self.prompt_config.system_prompt),
                HumanMessage(
                    content=self.prompt_config.user_prompt_template.format(
                        **self.extract_prompt_variables(state)
                    )
                ),
            ],
        }

    def __call__(self, state: AgentState) -> dict[str, Any]:
        logger.info("評価目標・基準策定を開始")
        return super().__call__(state)


class PlannerNode(BaseNode[AgentState, EvaluationPlan]):
    """評価計画立案ノード"""

    def __init__(self):
        super().__init__(
            prompt_config=PLANNER_PROMPT_CONFIG,
            output_schema=EvaluationPlan,
        )

    def should_skip(self, state: AgentState) -> bool:
        return state.get("goal") is None

    def extract_prompt_variables(self, state: AgentState) -> dict[str, Any]:
        input_data = state["input"]
        goal = state["goal"]
        return {
            "evaluation_goal": goal.goal,
            "evaluation_criteria": "\n".join(f"- {c}" for c in goal.criteria),
            "target": input_data.target[:500],
            "target_type": input_data.target_type,
        }

    def update_state(
        self, state: AgentState, output: EvaluationPlan
    ) -> dict[str, Any]:
        logger.info(f"評価計画立案完了: {len(output.steps)}個のステップ")
        return {"plan": output}

    def __call__(self, state: AgentState) -> dict[str, Any]:
        if self.should_skip(state):
            logger.warning("評価目標が設定されていません")
            return {}
        logger.info("評価計画立案を開始")
        return super().__call__(state)


class ExecutorNode:
    """情報収集・評価実行ノード

    ツール呼び出しを含むため、BaseNodeを継承せず独自実装する。
    """

    def __call__(self, state: AgentState) -> dict[str, Any]:
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
            if any(r.criterion == criterion for r in evaluation_results):
                continue

            logger.info(f"評価基準を評価: {criterion}")

            relevant_info = []
            for tr in tool_results:
                for result in tr.results[:3]:
                    if isinstance(result, SearchResult):
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


class ReflectorNode(BaseNode[AgentState, ReflectionResult]):
    """評価十分性検証ノード

    特殊なロジック: すべての評価基準が評価済みなら十分と判定。
    未評価の基準がある場合のみLLMに判定を委ねる。
    """

    def __init__(self):
        super().__init__(
            prompt_config=REFLECTOR_PROMPT_CONFIG,
            output_schema=ReflectionResult,
        )

    def should_skip(self, state: AgentState) -> bool:
        return state.get("goal") is None

    def extract_prompt_variables(self, state: AgentState) -> dict[str, Any]:
        goal = state["goal"]
        evaluation_results = state.get("evaluation_results", [])
        tool_results = state.get("tool_results", [])

        tool_summary = "\n".join(
            f"- {r.tool_name}: {r.query} → {len(r.results)}件" for r in tool_results
        )

        eval_summary = "\n".join(
            f"- {r.criterion}: {r.score}点 - {r.rationale[:100]}"
            for r in evaluation_results
        )

        return {
            "evaluation_goal": goal.goal,
            "evaluation_criteria": "\n".join(f"- {c}" for c in goal.criteria),
            "evaluation_results": eval_summary or "なし",
            "tool_results_summary": tool_summary or "なし",
        }

    def update_state(
        self, state: AgentState, output: ReflectionResult
    ) -> dict[str, Any]:
        logger.info(f"評価検証完了: 十分={output.is_sufficient}")
        return {
            "reflection": output,
            "retry_count": state.get("retry_count", 0) + 1,
        }

    def __call__(self, state: AgentState) -> dict[str, Any]:
        if self.should_skip(state):
            return {}

        logger.info("評価十分性検証を開始")

        goal = state["goal"]
        evaluation_results = state.get("evaluation_results", [])

        # コード側での十分性チェック
        evaluated_criteria = {r.criterion for r in evaluation_results}
        required_criteria = set(goal.criteria)
        missing_criteria = required_criteria - evaluated_criteria

        if not missing_criteria:
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
        return super().__call__(state)


class IntegratorNode(BaseNode[AgentState, EvaluationOutput]):
    """結果統合ノード"""

    def __init__(self):
        super().__init__(
            prompt_config=INTEGRATOR_PROMPT_CONFIG,
            output_schema=EvaluationOutput,
        )

    def should_skip(self, state: AgentState) -> bool:
        return state.get("goal") is None

    def extract_prompt_variables(self, state: AgentState) -> dict[str, Any]:
        input_data = state["input"]
        goal = state["goal"]
        evaluation_results = state.get("evaluation_results", [])
        tool_results = state.get("tool_results", [])

        eval_summary = "\n".join(
            f"- {r.criterion}: {r.score}点\n  根拠: {r.rationale}"
            for r in evaluation_results
        )

        collected_info = []
        for tr in tool_results:
            for result in tr.results[:3]:
                if isinstance(result, SearchResult):
                    collected_info.append(f"- {result.title}: {result.snippet}")

        return {
            "target": input_data.target[:500],
            "target_type": input_data.target_type,
            "evaluation_goal": goal.goal,
            "evaluation_criteria": "\n".join(f"- {c}" for c in goal.criteria),
            "evaluation_results": eval_summary or "なし",
            "collected_information": "\n".join(collected_info[:15]) or "なし",
        }

    def update_state(
        self, state: AgentState, output: EvaluationOutput
    ) -> dict[str, Any]:
        logger.info(f"結果統合完了: 総合スコア={output.overall_score}")
        return {"output": output}

    def __call__(self, state: AgentState) -> dict[str, Any]:
        if self.should_skip(state):
            return {}
        logger.info("結果統合を開始")
        return super().__call__(state)
