"""キーワード検索エージェントのテスト"""

from unittest.mock import MagicMock, patch

import pytest

from src.agents.keyword_finder.agent import (
    create_executor_node,
    create_integrator_node,
    create_planner_node,
    create_reflector_node,
    run_keyword_finder,
    should_continue,
)
from src.agents.keyword_finder.schemas import (
    AgentState,
    KeywordResult,
    KeywordSearchInput,
    KeywordSearchOutput,
    Plan,
    ReflectionResult,
    ToolResult,
)


class TestKeywordSearchInput:
    """KeywordSearchInputのテスト"""

    def test_valid_input(self):
        """有効な入力でインスタンスを作成できる"""
        input_data = KeywordSearchInput(
            category="資産形成",
            seed_keywords=["iDeCo", "積立NISA"],
            depth=2,
        )
        assert input_data.category == "資産形成"
        assert input_data.seed_keywords == ["iDeCo", "積立NISA"]
        assert input_data.depth == 2

    def test_default_depth(self):
        """depthのデフォルト値が2である"""
        input_data = KeywordSearchInput(
            category="健康",
            seed_keywords=["睡眠"],
        )
        assert input_data.depth == 2

    def test_invalid_category(self):
        """無効なカテゴリでエラーが発生する"""
        with pytest.raises(ValueError):
            KeywordSearchInput(
                category="無効なカテゴリ",
                seed_keywords=["test"],
            )

    def test_empty_seed_keywords(self):
        """空のシードキーワードでエラーが発生する"""
        with pytest.raises(ValueError):
            KeywordSearchInput(
                category="資産形成",
                seed_keywords=[],
            )

    def test_depth_range(self):
        """depthは1-3の範囲でなければならない"""
        with pytest.raises(ValueError):
            KeywordSearchInput(
                category="資産形成",
                seed_keywords=["test"],
                depth=0,
            )
        with pytest.raises(ValueError):
            KeywordSearchInput(
                category="資産形成",
                seed_keywords=["test"],
                depth=4,
            )


class TestKeywordResult:
    """KeywordResultのテスト"""

    def test_valid_result(self):
        """有効な結果でインスタンスを作成できる"""
        result = KeywordResult(
            keyword="iDeCo 始め方",
            competition="低",
            relevance_score=0.85,
            suggested_topics=["iDeCoの始め方ガイド"],
        )
        assert result.keyword == "iDeCo 始め方"
        assert result.competition == "低"
        assert result.relevance_score == 0.85

    def test_relevance_score_range(self):
        """relevance_scoreは0-1の範囲でなければならない"""
        with pytest.raises(ValueError):
            KeywordResult(
                keyword="test",
                relevance_score=1.5,
            )
        with pytest.raises(ValueError):
            KeywordResult(
                keyword="test",
                relevance_score=-0.1,
            )


class TestKeywordSearchOutput:
    """KeywordSearchOutputのテスト"""

    def test_valid_output(self):
        """有効な出力でインスタンスを作成できる"""
        output = KeywordSearchOutput(
            category="資産形成",
            seed_keywords=["iDeCo"],
            results=[
                KeywordResult(
                    keyword="iDeCo 始め方",
                    relevance_score=0.9,
                )
            ],
            summary="iDeCoに関するキーワードを発見しました。",
        )
        assert output.category == "資産形成"
        assert len(output.results) == 1
        assert output.results[0].keyword == "iDeCo 始め方"


class TestShouldContinue:
    """should_continue のテスト"""

    def test_returns_integrate_when_sufficient(self):
        """十分な結果がある場合はintegrateを返す"""
        state: AgentState = {
            "input": KeywordSearchInput(category="資産形成", seed_keywords=["test"]),
            "messages": [],
            "plan": None,
            "tool_results": [],
            "discovered_keywords": [],
            "reflection": ReflectionResult(
                is_sufficient=True,
                feedback="十分なキーワードが見つかりました",
                additional_queries=[],
            ),
            "retry_count": 1,
            "output": None,
        }
        assert should_continue(state) == "integrate"

    def test_returns_integrate_when_max_retry_reached(self):
        """最大リトライ回数に達した場合はintegrateを返す"""
        state: AgentState = {
            "input": KeywordSearchInput(category="資産形成", seed_keywords=["test"]),
            "messages": [],
            "plan": None,
            "tool_results": [],
            "discovered_keywords": [],
            "reflection": ReflectionResult(
                is_sufficient=False,
                feedback="キーワードが不足",
                additional_queries=["追加検索が必要"],
            ),
            "retry_count": 3,
            "output": None,
        }
        assert should_continue(state) == "integrate"

    def test_returns_execute_when_not_sufficient(self):
        """結果が不十分な場合はexecuteを返す"""
        state: AgentState = {
            "input": KeywordSearchInput(category="資産形成", seed_keywords=["test"]),
            "messages": [],
            "plan": None,
            "tool_results": [],
            "discovered_keywords": [],
            "reflection": ReflectionResult(
                is_sufficient=False,
                feedback="キーワードが不足",
                additional_queries=["追加検索が必要"],
            ),
            "retry_count": 1,
            "output": None,
        }
        assert should_continue(state) == "execute"

    def test_returns_execute_when_no_reflection(self):
        """reflectionがない場合はexecuteを返す"""
        state: AgentState = {
            "input": KeywordSearchInput(category="資産形成", seed_keywords=["test"]),
            "messages": [],
            "plan": None,
            "tool_results": [],
            "discovered_keywords": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }
        assert should_continue(state) == "execute"


class TestCreatePlannerNode:
    """create_planner_node のテスト"""

    @patch("src.agents.keyword_finder.agent.get_structured_model")
    def test_planner_creates_plan(self, mock_get_model):
        mock_plan = Plan(
            subtasks=["サブタスク1", "サブタスク2"],
            reasoning="計画の理由",
        )
        mock_model = MagicMock()
        mock_model.invoke.return_value = mock_plan
        mock_get_model.return_value = mock_model

        planner = create_planner_node()
        state: AgentState = {
            "input": KeywordSearchInput(category="資産形成", seed_keywords=["iDeCo"]),
            "messages": [],
            "plan": None,
            "tool_results": [],
            "discovered_keywords": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        result = planner(state)

        assert result["plan"] == mock_plan
        assert "messages" in result


class TestCreateExecutorNode:
    """create_executor_node のテスト"""

    def test_executor_returns_empty_when_no_plan(self):
        executor = create_executor_node()
        state: AgentState = {
            "input": KeywordSearchInput(category="資産形成", seed_keywords=["iDeCo"]),
            "messages": [],
            "plan": None,
            "tool_results": [],
            "discovered_keywords": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        result = executor(state)

        assert result == {}

    @patch("src.agents.keyword_finder.agent.get_related_keywords")
    @patch("src.agents.keyword_finder.agent.search_web")
    @patch("src.agents.keyword_finder.agent.get_chat_model")
    def test_executor_processes_tool_calls(
        self, mock_get_chat_model, mock_search_web, mock_get_related
    ):
        # ツール呼び出しをシミュレート
        mock_response = MagicMock()
        mock_response.tool_calls = [
            {"name": "get_related_keywords", "args": {"keyword": "iDeCo"}}
        ]

        mock_model = MagicMock()
        mock_model.bind_tools.return_value = mock_model
        mock_model.invoke.return_value = mock_response
        mock_get_chat_model.return_value = mock_model

        mock_get_related.invoke.return_value = ["iDeCo 始め方", "iDeCo メリット"]

        executor = create_executor_node()
        state: AgentState = {
            "input": KeywordSearchInput(category="資産形成", seed_keywords=["iDeCo"]),
            "messages": [],
            "plan": Plan(subtasks=["関連キーワードを取得"], reasoning="test"),
            "tool_results": [],
            "discovered_keywords": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        result = executor(state)

        assert "tool_results" in result
        assert "discovered_keywords" in result


class TestCreateReflectorNode:
    """create_reflector_node のテスト"""

    @patch("src.agents.keyword_finder.agent.get_structured_model")
    def test_reflector_evaluates_results(self, mock_get_model):
        mock_reflection = ReflectionResult(
            is_sufficient=True,
            feedback="十分なキーワードが見つかりました",
            additional_queries=[],
        )
        mock_model = MagicMock()
        mock_model.invoke.return_value = mock_reflection
        mock_get_model.return_value = mock_model

        reflector = create_reflector_node()
        state: AgentState = {
            "input": KeywordSearchInput(category="資産形成", seed_keywords=["iDeCo"]),
            "messages": [],
            "plan": None,
            "tool_results": [
                ToolResult(tool_name="search_web", query="iDeCo", results=[])
            ],
            "discovered_keywords": ["iDeCo 始め方", "iDeCo メリット"],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        result = reflector(state)

        assert result["reflection"] == mock_reflection
        assert result["retry_count"] == 1


class TestCreateIntegratorNode:
    """create_integrator_node のテスト"""

    @patch("src.agents.keyword_finder.agent.get_structured_model")
    def test_integrator_creates_output(self, mock_get_model):
        mock_output = KeywordSearchOutput(
            category="資産形成",
            seed_keywords=["iDeCo"],
            results=[
                KeywordResult(keyword="iDeCo 始め方", relevance_score=0.9)
            ],
            summary="キーワードを発見しました",
        )
        mock_model = MagicMock()
        mock_model.invoke.return_value = mock_output
        mock_get_model.return_value = mock_model

        integrator = create_integrator_node()
        state: AgentState = {
            "input": KeywordSearchInput(category="資産形成", seed_keywords=["iDeCo"]),
            "messages": [],
            "plan": None,
            "tool_results": [],
            "discovered_keywords": ["iDeCo 始め方"],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        result = integrator(state)

        assert result["output"] == mock_output


class TestRunKeywordFinder:
    """run_keyword_finder のテスト"""

    @patch("src.agents.keyword_finder.agent.create_keyword_finder_graph")
    def test_returns_output_on_success(self, mock_create_graph):
        expected_output = KeywordSearchOutput(
            category="資産形成",
            seed_keywords=["iDeCo"],
            results=[KeywordResult(keyword="iDeCo 始め方", relevance_score=0.9)],
            summary="キーワードを発見しました",
        )

        mock_graph = MagicMock()
        mock_graph.invoke.return_value = {"output": expected_output}
        mock_create_graph.return_value = mock_graph

        input_data = KeywordSearchInput(category="資産形成", seed_keywords=["iDeCo"])
        result = run_keyword_finder(input_data)

        assert result == expected_output

    @patch("src.agents.keyword_finder.agent.create_keyword_finder_graph")
    def test_returns_fallback_on_no_output(self, mock_create_graph):
        mock_graph = MagicMock()
        mock_graph.invoke.return_value = {"output": None}
        mock_create_graph.return_value = mock_graph

        input_data = KeywordSearchInput(category="資産形成", seed_keywords=["iDeCo"])
        result = run_keyword_finder(input_data)

        assert result.category == "資産形成"
        assert result.results == []
        assert "失敗" in result.summary
