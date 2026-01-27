"""Writer Agent Tests"""

import pytest
from unittest.mock import MagicMock, patch

from langgraph.graph import StateGraph

# =============================================================================
# Schema Tests
# =============================================================================


class TestWriterInput:
    """WriterInput schema tests"""

    def test_valid_input(self):
        from src.agents.writer.schemas import WriterInput

        input_data = WriterInput(
            topic="Pythonの基礎",
            keywords=["Python", "プログラミング", "入門"],
        )
        assert input_data.topic == "Pythonの基礎"
        assert len(input_data.keywords) == 3

    def test_default_values(self):
        from src.agents.writer.schemas import WriterInput

        input_data = WriterInput(
            topic="テスト",
            keywords=["キーワード"],
        )
        assert input_data.target_length == 2000
        assert input_data.tone == "informative"

    def test_custom_values(self):
        from src.agents.writer.schemas import WriterInput

        input_data = WriterInput(
            topic="テスト",
            keywords=["キーワード"],
            target_length=3000,
            tone="casual",
        )
        assert input_data.target_length == 3000
        assert input_data.tone == "casual"

    def test_empty_keywords_raises_error(self):
        from src.agents.writer.schemas import WriterInput

        with pytest.raises(ValueError):
            WriterInput(topic="テスト", keywords=[])


class TestSection:
    """Section schema tests"""

    def test_valid_section(self):
        from src.agents.writer.schemas import Section

        section = Section(
            heading="はじめに",
            level=2,
            content="これは導入部分です。",
        )
        assert section.heading == "はじめに"
        assert section.level == 2

    def test_level_range(self):
        from src.agents.writer.schemas import Section

        # Valid levels
        Section(heading="H2", level=2, content="content")
        Section(heading="H3", level=3, content="content")

        # Invalid level
        with pytest.raises(ValueError):
            Section(heading="H1", level=1, content="content")
        with pytest.raises(ValueError):
            Section(heading="H5", level=5, content="content")


class TestArticlePlan:
    """ArticlePlan schema tests"""

    def test_valid_plan(self):
        from src.agents.writer.schemas import ArticlePlan, PlannedSection

        plan = ArticlePlan(
            title="Python入門ガイド",
            sections=[
                PlannedSection(heading="はじめに", level=2, description="導入"),
                PlannedSection(heading="基本文法", level=2, description="文法解説"),
            ],
        )
        assert plan.title == "Python入門ガイド"
        assert len(plan.sections) == 2


class TestWriterOutput:
    """WriterOutput schema tests"""

    def test_valid_output(self):
        from src.agents.writer.schemas import WriterOutput, Section

        output = WriterOutput(
            title="Python入門",
            description="Pythonの基礎を学ぶ",
            content="# Python入門\n\n本文...",
            keywords_used=["Python", "入門"],
            sections=[
                Section(heading="はじめに", level=2, content="導入"),
            ],
            summary="記事を生成しました",
        )
        assert output.title == "Python入門"
        assert len(output.sections) == 1


# =============================================================================
# Node Tests
# =============================================================================


class TestPlannerNode:
    """PlannerNode tests"""

    def test_planner_creates_plan(self):
        from src.agents.writer.nodes import PlannerNode
        from src.agents.writer.schemas import ArticlePlan, PlannedSection, WriterInput

        mock_plan = ArticlePlan(
            title="テスト記事",
            sections=[
                PlannedSection(heading="導入", level=2, description="導入部分"),
            ],
        )

        with patch("src.core.nodes.base.BaseNode._get_model_factory") as mock_factory:
            mock_model = MagicMock()
            mock_model.invoke.return_value = mock_plan
            mock_factory.return_value = lambda schema: mock_model

            node = PlannerNode()
            state = {
                "input": WriterInput(topic="テスト", keywords=["キーワード"]),
                "messages": [],
                "plan": None,
                "sections": [],
                "reflection": None,
                "retry_count": 0,
                "output": None,
            }

            result = node(state)

            assert "plan" in result
            assert result["plan"].title == "テスト記事"


class TestExecutorNode:
    """ExecutorNode tests"""

    def test_executor_writes_sections(self):
        from src.agents.writer.nodes import ExecutorNode
        from src.agents.writer.schemas import (
            ArticlePlan,
            PlannedSection,
            Section,
            WriterInput,
        )

        mock_section = Section(
            heading="導入",
            level=2,
            content="これは導入部分です。",
        )

        with patch("src.core.nodes.base.BaseNode._get_model_factory") as mock_factory:
            mock_model = MagicMock()
            mock_model.invoke.return_value = mock_section
            mock_factory.return_value = lambda schema: mock_model

            node = ExecutorNode()
            state = {
                "input": WriterInput(topic="テスト", keywords=["キーワード"]),
                "messages": [],
                "plan": ArticlePlan(
                    title="テスト",
                    sections=[
                        PlannedSection(heading="導入", level=2, description="導入部分"),
                    ],
                ),
                "sections": [],
                "reflection": None,
                "retry_count": 0,
                "output": None,
            }

            result = node(state)

            assert "sections" in result
            assert len(result["sections"]) == 1

    def test_executor_returns_empty_when_no_plan(self):
        from src.agents.writer.nodes import ExecutorNode
        from src.agents.writer.schemas import WriterInput

        node = ExecutorNode()
        state = {
            "input": WriterInput(topic="テスト", keywords=["キーワード"]),
            "messages": [],
            "plan": None,
            "sections": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        result = node(state)
        assert result == {}


class TestReflectorNode:
    """ReflectorNode tests"""

    def test_reflector_evaluates_content(self):
        from src.agents.writer.nodes import ReflectorNode
        from src.agents.writer.schemas import (
            ArticlePlan,
            PlannedSection,
            ReflectionResult,
            Section,
            WriterInput,
        )

        mock_reflection = ReflectionResult(
            is_sufficient=True,
            feedback="十分な内容です",
            missing_keywords=[],
            quality_issues=[],
        )

        with patch("src.core.nodes.base.BaseNode._get_model_factory") as mock_factory:
            mock_model = MagicMock()
            mock_model.invoke.return_value = mock_reflection
            mock_factory.return_value = lambda schema: mock_model

            node = ReflectorNode()
            state = {
                "input": WriterInput(topic="テスト", keywords=["キーワード"]),
                "messages": [],
                "plan": ArticlePlan(
                    title="テスト",
                    sections=[PlannedSection(heading="導入", level=2, description="")],
                ),
                "sections": [
                    Section(heading="導入", level=2, content="キーワードを含む内容")
                ],
                "reflection": None,
                "retry_count": 0,
                "output": None,
            }

            result = node(state)

            assert "reflection" in result
            assert result["reflection"].is_sufficient is True


class TestIntegratorNode:
    """IntegratorNode tests"""

    def test_integrator_creates_output(self):
        from src.agents.writer.nodes import IntegratorNode
        from src.agents.writer.schemas import (
            ArticlePlan,
            PlannedSection,
            Section,
            WriterInput,
            WriterOutput,
        )

        mock_output = WriterOutput(
            title="テスト記事",
            description="テストの説明",
            content="# テスト\n\n本文",
            keywords_used=["キーワード"],
            sections=[Section(heading="導入", level=2, content="内容")],
            summary="完了",
        )

        with patch("src.core.nodes.base.BaseNode._get_model_factory") as mock_factory:
            mock_model = MagicMock()
            mock_model.invoke.return_value = mock_output
            mock_factory.return_value = lambda schema: mock_model

            node = IntegratorNode()
            state = {
                "input": WriterInput(topic="テスト", keywords=["キーワード"]),
                "messages": [],
                "plan": ArticlePlan(
                    title="テスト",
                    sections=[PlannedSection(heading="導入", level=2, description="")],
                ),
                "sections": [Section(heading="導入", level=2, content="内容")],
                "reflection": None,
                "retry_count": 0,
                "output": None,
            }

            result = node(state)

            assert "output" in result
            assert result["output"].title == "テスト記事"


# =============================================================================
# Agent Tests
# =============================================================================


class TestWriterAgent:
    """WriterAgent tests"""

    def test_get_state_class(self):
        from src.agents.writer.agent import WriterAgent
        from src.agents.writer.schemas import AgentState

        agent = WriterAgent()
        assert agent.get_state_class() == AgentState

    def test_create_nodes_returns_dict_with_angle_nodes(self):
        """create_nodesがangle_proposalとangle_selectを含む"""
        from src.agents.writer.agent import WriterAgent

        agent = WriterAgent()
        nodes = agent.create_nodes()

        assert isinstance(nodes, dict)
        assert "angle_proposal" in nodes
        assert "angle_select" in nodes
        assert "plan" in nodes
        assert "execute" in nodes
        assert "reflect" in nodes
        assert "integrate" in nodes

    def test_create_initial_state_with_angle_fields(self):
        """初期状態にangle_proposalsとselected_angleが含まれる"""
        from src.agents.writer.agent import WriterAgent
        from src.agents.writer.schemas import WriterInput

        agent = WriterAgent()
        input_data = WriterInput(topic="テスト", keywords=["キーワード"])
        state = agent.create_initial_state(input_data)

        assert state["input"] == input_data
        assert state["angle_proposals"] is None
        assert state["selected_angle"] is None
        assert state["plan"] is None
        assert state["sections"] == []
        assert state["retry_count"] == 0

    def test_extract_output_returns_output(self):
        """extract_outputがoutputを返す"""
        from src.agents.writer.agent import WriterAgent
        from src.agents.writer.schemas import Section, WriterInput, WriterOutput

        agent = WriterAgent()
        expected_output = WriterOutput(
            title="テスト記事",
            description="説明",
            content="本文",
            keywords_used=["キーワード"],
            sections=[Section(heading="導入", level=2, content="内容")],
            summary="完了",
        )
        final_state = {
            "input": WriterInput(topic="テスト", keywords=["キーワード"]),
            "messages": [],
            "plan": None,
            "sections": [],
            "reflection": None,
            "retry_count": 0,
            "output": expected_output,
        }

        result = agent.extract_output(final_state)
        assert result == expected_output

    def test_extract_output_returns_fallback_when_no_output(self):
        """outputがない場合はフォールバックを返す"""
        from src.agents.writer.agent import WriterAgent
        from src.agents.writer.schemas import WriterInput

        agent = WriterAgent()
        final_state = {
            "input": WriterInput(topic="テスト", keywords=["キーワード"]),
            "messages": [],
            "plan": None,
            "sections": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        result = agent.extract_output(final_state)
        assert result.title == "テスト"
        assert "失敗" in result.summary

    def test_define_graph_edges(self):
        """define_graph_edgesがグラフにエッジを追加する"""
        from src.agents.writer.agent import WriterAgent
        from src.agents.writer.schemas import AgentState

        agent = WriterAgent()
        graph = StateGraph(AgentState)

        for name, node in agent.create_nodes().items():
            graph.add_node(name, node)

        agent.define_graph_edges(graph)

        compiled = graph.compile()
        assert compiled is not None


class TestCreateWriterGraph:
    """create_writer_graph tests"""

    def test_returns_compiled_graph(self):
        """コンパイル済みグラフを返す"""
        from src.agents.writer.agent import create_writer_graph

        graph = create_writer_graph()
        assert graph is not None


class TestBackwardCompatibilityFunctions:
    """後方互換関数のテスト"""

    def test_create_planner_node(self):
        from src.agents.writer.agent import create_planner_node
        from src.agents.writer.nodes import PlannerNode

        node = create_planner_node()
        assert isinstance(node, PlannerNode)

    def test_create_executor_node(self):
        from src.agents.writer.agent import create_executor_node
        from src.agents.writer.nodes import ExecutorNode

        node = create_executor_node()
        assert isinstance(node, ExecutorNode)

    def test_create_reflector_node(self):
        from src.agents.writer.agent import create_reflector_node
        from src.agents.writer.nodes import ReflectorNode

        node = create_reflector_node()
        assert isinstance(node, ReflectorNode)

    def test_create_integrator_node(self):
        from src.agents.writer.agent import create_integrator_node
        from src.agents.writer.nodes import IntegratorNode

        node = create_integrator_node()
        assert isinstance(node, IntegratorNode)


class TestShouldContinue:
    """should_continue function tests"""

    def test_returns_integrate_when_sufficient(self):
        from src.agents.writer.agent import should_continue
        from src.agents.writer.schemas import ReflectionResult

        state = {
            "reflection": ReflectionResult(
                is_sufficient=True,
                feedback="OK",
                missing_keywords=[],
                quality_issues=[],
            ),
            "retry_count": 1,
        }
        assert should_continue(state) == "integrate"

    def test_returns_integrate_when_max_retry_reached(self):
        from src.agents.writer.agent import should_continue
        from src.agents.writer.schemas import ReflectionResult

        state = {
            "reflection": ReflectionResult(
                is_sufficient=False,
                feedback="Not OK",
                missing_keywords=["kw"],
                quality_issues=[],
            ),
            "retry_count": 5,
        }
        assert should_continue(state) == "integrate"

    def test_returns_execute_when_not_sufficient(self):
        from src.agents.writer.agent import should_continue
        from src.agents.writer.schemas import ReflectionResult

        state = {
            "reflection": ReflectionResult(
                is_sufficient=False,
                feedback="Not OK",
                missing_keywords=["kw"],
                quality_issues=[],
            ),
            "retry_count": 1,
        }
        assert should_continue(state) == "execute"


class TestRunWriter:
    """run_writer function tests"""

    def test_returns_output_on_success(self):
        from src.agents.writer.agent import run_writer
        from src.agents.writer.schemas import Section, WriterInput, WriterOutput

        mock_output = WriterOutput(
            title="テスト",
            description="説明",
            content="本文",
            keywords_used=["キーワード"],
            sections=[Section(heading="導入", level=2, content="内容")],
            summary="完了",
        )

        with patch("src.agents.writer.agent.create_writer_graph") as mock_graph:
            mock_compiled = MagicMock()
            mock_compiled.invoke.return_value = {"output": mock_output}
            mock_graph.return_value = mock_compiled

            input_data = WriterInput(topic="テスト", keywords=["キーワード"])
            result = run_writer(input_data)

            assert result.title == "テスト"

    def test_returns_fallback_on_no_output(self):
        from src.agents.writer.agent import run_writer
        from src.agents.writer.schemas import WriterInput

        with patch("src.agents.writer.agent.create_writer_graph") as mock_graph:
            mock_compiled = MagicMock()
            mock_compiled.invoke.return_value = {"output": None}
            mock_graph.return_value = mock_compiled

            input_data = WriterInput(topic="テスト", keywords=["キーワード"])
            result = run_writer(input_data)

            assert "失敗" in result.summary
