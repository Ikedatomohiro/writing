"""キーワード検索エージェントノード

BaseNode を継承したノードクラスの定義。
"""

from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage

from src.agents.keyword_finder.prompts import (
    INTEGRATOR_PROMPT_CONFIG,
    PLANNER_PROMPT_CONFIG,
    REFLECTOR_PROMPT_CONFIG,
)
from src.agents.keyword_finder.schemas import (
    AgentState,
    KeywordSearchOutput,
    Plan,
    ReflectionResult,
    ToolResult,
)
from src.common import get_logger
from src.core.nodes import BaseNode
from src.models import get_chat_model
from src.tools import get_related_keywords, search_web

logger = get_logger(__name__)

# 利用可能なツール
TOOLS = [search_web, get_related_keywords]


class PlannerNode(BaseNode[AgentState, Plan]):
    """計画立案ノード"""

    def __init__(self):
        super().__init__(
            prompt_config=PLANNER_PROMPT_CONFIG,
            output_schema=Plan,
        )

    def extract_prompt_variables(self, state: AgentState) -> dict[str, Any]:
        input_data = state["input"]
        return {
            "category": input_data.category,
            "seed_keywords": ", ".join(input_data.seed_keywords),
            "depth": input_data.depth,
        }

    def update_state(self, state: AgentState, output: Plan) -> dict[str, Any]:
        logger.info(f"計画立案完了: {len(output.subtasks)}個のサブタスク")
        return {
            "plan": output,
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
        logger.info("計画立案を開始")
        return super().__call__(state)


class ExecutorNode:
    """ツール実行ノード

    BaseNodeを継承しない理由:
    - BaseNodeは単一のLLM呼び出しで構造化出力を返す設計
    - 本ノードは複数のツール呼び出し（Web検索、関連キーワード取得）を動的に実行
    - サブタスクごとの反復処理とツール結果の蓄積が必要
    - これらの要件はBaseNodeの抽象化に適さないため、独自実装とする
    """

    def __call__(self, state: AgentState) -> dict[str, Any]:
        logger.info("ツール実行を開始")

        plan = state["plan"]
        if not plan:
            return {}

        tool_results = []
        discovered_keywords = list(state.get("discovered_keywords", []))

        model = get_chat_model().bind_tools(TOOLS)

        for subtask in plan.subtasks:
            logger.info(f"サブタスク実行: {subtask}")

            messages = [
                SystemMessage(content="サブタスクを実行してください。"),
                HumanMessage(content=subtask),
            ]

            response = model.invoke(messages)

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
                                query=tool_args.get("query", ""),
                                results=results,
                            )
                        )
                    elif tool_name == "get_related_keywords":
                        results = get_related_keywords.invoke(tool_args)
                        discovered_keywords.extend(results)
                        tool_results.append(
                            ToolResult(
                                tool_name=tool_name,
                                query=tool_args.get("keyword", ""),
                                results=results,
                            )
                        )

        logger.info(
            f"ツール実行完了: {len(tool_results)}回実行, "
            f"{len(discovered_keywords)}個のキーワード発見"
        )

        return {
            "tool_results": tool_results,
            "discovered_keywords": discovered_keywords,
        }


class ReflectorNode(BaseNode[AgentState, ReflectionResult]):
    """内省ノード"""

    def __init__(self):
        super().__init__(
            prompt_config=REFLECTOR_PROMPT_CONFIG,
            output_schema=ReflectionResult,
        )

    def extract_prompt_variables(self, state: AgentState) -> dict[str, Any]:
        input_data = state["input"]
        discovered_keywords = state.get("discovered_keywords", [])
        tool_results = state.get("tool_results", [])

        tool_summary = "\n".join(
            f"- {r.tool_name}: {r.query} → {len(r.results)}件" for r in tool_results
        )

        return {
            "category": input_data.category,
            "seed_keywords": ", ".join(input_data.seed_keywords),
            "discovered_keywords": "\n".join(
                f"- {kw}" for kw in discovered_keywords[:30]
            ),
            "tool_results_summary": tool_summary,
        }

    def update_state(
        self, state: AgentState, output: ReflectionResult
    ) -> dict[str, Any]:
        logger.info(f"内省完了: 十分={output.is_sufficient}")
        return {
            "reflection": output,
            "retry_count": state.get("retry_count", 0) + 1,
        }

    def __call__(self, state: AgentState) -> dict[str, Any]:
        logger.info("内省を開始")
        return super().__call__(state)


class IntegratorNode(BaseNode[AgentState, KeywordSearchOutput]):
    """結果統合ノード"""

    def __init__(self):
        super().__init__(
            prompt_config=INTEGRATOR_PROMPT_CONFIG,
            output_schema=KeywordSearchOutput,
        )

    def extract_prompt_variables(self, state: AgentState) -> dict[str, Any]:
        input_data = state["input"]
        discovered_keywords = state.get("discovered_keywords", [])
        tool_results = state.get("tool_results", [])

        search_summary = []
        for r in tool_results:
            if r.tool_name == "search_web":
                for result in r.results[:3]:
                    search_summary.append(f"- {result.title}: {result.snippet}")

        return {
            "category": input_data.category,
            "seed_keywords": ", ".join(input_data.seed_keywords),
            "discovered_keywords": "\n".join(
                f"- {kw}" for kw in set(discovered_keywords)
            ),
            "search_results": "\n".join(search_summary) or "なし",
        }

    def update_state(
        self, state: AgentState, output: KeywordSearchOutput
    ) -> dict[str, Any]:
        logger.info(f"結果統合完了: {len(output.results)}個のキーワード")
        return {"output": output}

    def __call__(self, state: AgentState) -> dict[str, Any]:
        logger.info("結果統合を開始")
        return super().__call__(state)
