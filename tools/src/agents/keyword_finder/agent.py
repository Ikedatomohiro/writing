"""キーワード検索エージェント"""

from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import END, StateGraph

from src.agents.keyword_finder.prompts import (
    INTEGRATOR_SYSTEM_PROMPT,
    INTEGRATOR_USER_PROMPT,
    PLANNER_SYSTEM_PROMPT,
    PLANNER_USER_PROMPT,
    REFLECTOR_SYSTEM_PROMPT,
    REFLECTOR_USER_PROMPT,
)
from src.agents.keyword_finder.schemas import (
    AgentState,
    KeywordSearchInput,
    KeywordSearchOutput,
    Plan,
    ReflectionResult,
    ToolResult,
)
from src.common import get_logger, settings
from src.models import get_chat_model, get_structured_model
from src.tools import get_related_keywords, search_web

logger = get_logger(__name__)

# 利用可能なツール
TOOLS = [search_web, get_related_keywords]


def create_planner_node():
    """計画立案ノードを作成"""

    def planner(state: AgentState) -> dict:
        logger.info("計画立案を開始")

        input_data = state["input"]
        model = get_structured_model(Plan)

        messages = [
            SystemMessage(content=PLANNER_SYSTEM_PROMPT),
            HumanMessage(
                content=PLANNER_USER_PROMPT.format(
                    category=input_data.category,
                    seed_keywords=", ".join(input_data.seed_keywords),
                    depth=input_data.depth,
                )
            ),
        ]

        plan = model.invoke(messages)
        logger.info(f"計画立案完了: {len(plan.subtasks)}個のサブタスク")

        return {
            "plan": plan,
            "messages": messages,
        }

    return planner


def create_executor_node():
    """ツール実行ノードを作成"""

    def executor(state: AgentState) -> dict:
        logger.info("ツール実行を開始")

        plan = state["plan"]
        if not plan:
            return {}

        tool_results = []
        discovered_keywords = list(state.get("discovered_keywords", []))

        model = get_chat_model().bind_tools(TOOLS)

        for subtask in plan.subtasks:
            logger.info(f"サブタスク実行: {subtask}")

            # ツールを実行
            messages = [
                SystemMessage(content="サブタスクを実行してください。"),
                HumanMessage(content=subtask),
            ]

            response = model.invoke(messages)

            # ツール呼び出しがある場合は実行
            if response.tool_calls:
                for tool_call in response.tool_calls:
                    tool_name = tool_call["name"]
                    tool_args = tool_call["args"]

                    logger.info(f"ツール呼び出し: {tool_name}({tool_args})")

                    # ツールを実行
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

    return executor


def create_reflector_node():
    """内省ノードを作成"""

    def reflector(state: AgentState) -> dict:
        logger.info("内省を開始")

        input_data = state["input"]
        discovered_keywords = state.get("discovered_keywords", [])
        tool_results = state.get("tool_results", [])

        # ツール結果のサマリーを作成
        tool_summary = "\n".join(
            f"- {r.tool_name}: {r.query} → {len(r.results)}件"
            for r in tool_results
        )

        model = get_structured_model(ReflectionResult)

        messages = [
            SystemMessage(content=REFLECTOR_SYSTEM_PROMPT),
            HumanMessage(
                content=REFLECTOR_USER_PROMPT.format(
                    category=input_data.category,
                    seed_keywords=", ".join(input_data.seed_keywords),
                    discovered_keywords="\n".join(
                        f"- {kw}" for kw in discovered_keywords[:30]
                    ),
                    tool_results_summary=tool_summary,
                )
            ),
        ]

        reflection = model.invoke(messages)
        logger.info(f"内省完了: 十分={reflection.is_sufficient}")

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
        discovered_keywords = state.get("discovered_keywords", [])
        tool_results = state.get("tool_results", [])

        # 検索結果のサマリー
        search_summary = []
        for r in tool_results:
            if r.tool_name == "search_web":
                for result in r.results[:3]:
                    search_summary.append(f"- {result.title}: {result.snippet}")

        model = get_structured_model(KeywordSearchOutput)

        messages = [
            SystemMessage(content=INTEGRATOR_SYSTEM_PROMPT),
            HumanMessage(
                content=INTEGRATOR_USER_PROMPT.format(
                    category=input_data.category,
                    seed_keywords=", ".join(input_data.seed_keywords),
                    discovered_keywords="\n".join(
                        f"- {kw}" for kw in set(discovered_keywords)
                    ),
                    search_results="\n".join(search_summary) or "なし",
                )
            ),
        ]

        output = model.invoke(messages)
        logger.info(f"結果統合完了: {len(output.results)}個のキーワード")

        return {"output": output}

    return integrator


def should_continue(state: AgentState) -> str:
    """継続判定"""
    reflection = state.get("reflection")
    retry_count = state.get("retry_count", 0)

    if reflection and reflection.is_sufficient:
        return "integrate"

    if retry_count >= settings.max_retry_count:
        logger.warning(f"最大リトライ回数（{settings.max_retry_count}）に達しました")
        return "integrate"

    return "execute"


def create_keyword_finder_graph() -> StateGraph:
    """キーワード検索エージェントのグラフを作成"""

    # グラフを構築
    graph = StateGraph(AgentState)

    # ノードを追加
    graph.add_node("plan", create_planner_node())
    graph.add_node("execute", create_executor_node())
    graph.add_node("reflect", create_reflector_node())
    graph.add_node("integrate", create_integrator_node())

    # エッジを追加
    graph.set_entry_point("plan")
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
