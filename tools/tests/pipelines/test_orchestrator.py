"""Orchestrator tests.

Tests for multi-agent orchestration and workflow execution.
"""

from typing import Any
from unittest.mock import MagicMock, patch

import pytest

from src.pipelines.orchestrator import (
    AgentOrchestrator,
    WorkflowStep,
    WorkflowResult,
    OrchestratorError,
    AgentNotFoundError,
)


class TestAgentOrchestrator:
    """AgentOrchestratorのテスト"""

    def test_init_creates_empty_registry(self):
        """初期化時にエージェントレジストリが空である"""
        orchestrator = AgentOrchestrator()
        assert orchestrator.list_agents() == []

    def test_register_agent(self):
        """エージェントを登録できる"""
        orchestrator = AgentOrchestrator()
        mock_agent = MagicMock()
        mock_agent.name = "test_agent"

        orchestrator.register_agent("test_agent", mock_agent)

        assert "test_agent" in orchestrator.list_agents()

    def test_register_multiple_agents(self):
        """複数エージェントを登録できる"""
        orchestrator = AgentOrchestrator()
        agent1 = MagicMock()
        agent1.name = "agent1"
        agent2 = MagicMock()
        agent2.name = "agent2"

        orchestrator.register_agent("agent1", agent1)
        orchestrator.register_agent("agent2", agent2)

        agents = orchestrator.list_agents()
        assert "agent1" in agents
        assert "agent2" in agents
        assert len(agents) == 2

    def test_get_agent(self):
        """登録済みエージェントを取得できる"""
        orchestrator = AgentOrchestrator()
        mock_agent = MagicMock()

        orchestrator.register_agent("test_agent", mock_agent)

        retrieved = orchestrator.get_agent("test_agent")
        assert retrieved == mock_agent

    def test_get_agent_not_found(self):
        """未登録エージェントの取得でエラー"""
        orchestrator = AgentOrchestrator()

        with pytest.raises(AgentNotFoundError):
            orchestrator.get_agent("nonexistent")


class TestWorkflowStep:
    """WorkflowStepのテスト"""

    def test_create_step(self):
        """ステップを作成できる"""
        step = WorkflowStep(
            agent_name="keyword_finder",
            input_mapping={"category": "context.category"},
        )

        assert step.agent_name == "keyword_finder"
        assert step.input_mapping == {"category": "context.category"}

    def test_step_with_output_key(self):
        """出力キーを指定できる"""
        step = WorkflowStep(
            agent_name="keyword_finder",
            output_key="keywords",
        )

        assert step.output_key == "keywords"

    def test_step_default_output_key(self):
        """デフォルトの出力キーはエージェント名"""
        step = WorkflowStep(agent_name="keyword_finder")

        assert step.output_key == "keyword_finder"


class TestWorkflowExecution:
    """ワークフロー実行のテスト"""

    def test_run_single_step_workflow(self):
        """単一ステップのワークフローを実行できる"""
        orchestrator = AgentOrchestrator()

        mock_agent = MagicMock()
        mock_output = MagicMock()
        mock_output.model_dump.return_value = {"result": "test_result"}
        mock_agent.run.return_value = mock_output

        orchestrator.register_agent("test_agent", mock_agent)

        steps = [WorkflowStep(agent_name="test_agent")]
        result = orchestrator.run_workflow(steps, initial_context={})

        assert isinstance(result, WorkflowResult)
        assert result.success is True
        assert "test_agent" in result.outputs

    def test_run_sequential_workflow(self):
        """シーケンシャルワークフローを実行できる"""
        orchestrator = AgentOrchestrator()

        # Agent 1
        agent1 = MagicMock()
        output1 = MagicMock()
        output1.model_dump.return_value = {"keywords": ["keyword1", "keyword2"]}
        agent1.run.return_value = output1

        # Agent 2
        agent2 = MagicMock()
        output2 = MagicMock()
        output2.model_dump.return_value = {"score": 0.85}
        agent2.run.return_value = output2

        orchestrator.register_agent("keyword_finder", agent1)
        orchestrator.register_agent("evaluator", agent2)

        steps = [
            WorkflowStep(agent_name="keyword_finder"),
            WorkflowStep(agent_name="evaluator"),
        ]
        result = orchestrator.run_workflow(steps, initial_context={"category": "tech"})

        assert result.success is True
        assert "keyword_finder" in result.outputs
        assert "evaluator" in result.outputs

    def test_context_passed_between_steps(self):
        """ステップ間でコンテキストが渡される"""
        orchestrator = AgentOrchestrator()

        agent1 = MagicMock()
        output1 = MagicMock()
        output1.model_dump.return_value = {"data": "from_agent1"}
        agent1.run.return_value = output1

        agent2 = MagicMock()
        output2 = MagicMock()
        output2.model_dump.return_value = {"processed": True}
        agent2.run.return_value = output2

        orchestrator.register_agent("agent1", agent1)
        orchestrator.register_agent("agent2", agent2)

        steps = [
            WorkflowStep(agent_name="agent1"),
            WorkflowStep(
                agent_name="agent2",
                input_mapping={"input_data": "agent1.data"},
            ),
        ]
        result = orchestrator.run_workflow(steps, initial_context={})

        assert result.success is True
        # agent2はagent1の出力を参照できる
        assert result.context.get("agent1") is not None

    def test_workflow_with_unregistered_agent(self):
        """未登録エージェントでエラー"""
        orchestrator = AgentOrchestrator()

        steps = [WorkflowStep(agent_name="nonexistent")]

        with pytest.raises(AgentNotFoundError):
            orchestrator.run_workflow(steps, initial_context={})


class TestContextMerging:
    """コンテキストマージのテスト"""

    def test_merge_initial_context(self):
        """初期コンテキストがマージされる"""
        orchestrator = AgentOrchestrator()

        mock_agent = MagicMock()
        mock_output = MagicMock()
        mock_output.model_dump.return_value = {"result": "done"}
        mock_agent.run.return_value = mock_output

        orchestrator.register_agent("test_agent", mock_agent)

        steps = [WorkflowStep(agent_name="test_agent")]
        initial = {"category": "tech", "user_id": "123"}
        result = orchestrator.run_workflow(steps, initial_context=initial)

        assert result.context["category"] == "tech"
        assert result.context["user_id"] == "123"

    def test_agent_output_merged_to_context(self):
        """エージェント出力がコンテキストにマージされる"""
        orchestrator = AgentOrchestrator()

        mock_agent = MagicMock()
        mock_output = MagicMock()
        mock_output.model_dump.return_value = {"keywords": ["a", "b"]}
        mock_agent.run.return_value = mock_output

        orchestrator.register_agent("keyword_finder", mock_agent)

        steps = [WorkflowStep(agent_name="keyword_finder")]
        result = orchestrator.run_workflow(steps, initial_context={})

        assert "keyword_finder" in result.context
        assert result.context["keyword_finder"]["keywords"] == ["a", "b"]


class TestInputMapping:
    """入力マッピングのテスト"""

    def test_map_from_context(self):
        """コンテキストから入力をマッピングできる"""
        orchestrator = AgentOrchestrator()

        mock_agent = MagicMock()
        mock_output = MagicMock()
        mock_output.model_dump.return_value = {"result": "done"}
        mock_agent.run.return_value = mock_output

        orchestrator.register_agent("test_agent", mock_agent)

        steps = [
            WorkflowStep(
                agent_name="test_agent",
                input_mapping={"category": "context.category"},
            )
        ]
        result = orchestrator.run_workflow(
            steps, initial_context={"category": "health"}
        )

        assert result.success is True

    def test_map_from_previous_agent_output(self):
        """前のエージェントの出力から入力をマッピングできる"""
        orchestrator = AgentOrchestrator()

        agent1 = MagicMock()
        output1 = MagicMock()
        output1.model_dump.return_value = {"keywords": ["k1", "k2"]}
        agent1.run.return_value = output1

        agent2 = MagicMock()
        output2 = MagicMock()
        output2.model_dump.return_value = {"evaluated": True}
        agent2.run.return_value = output2

        orchestrator.register_agent("finder", agent1)
        orchestrator.register_agent("evaluator", agent2)

        steps = [
            WorkflowStep(agent_name="finder"),
            WorkflowStep(
                agent_name="evaluator",
                input_mapping={"keywords": "finder.keywords"},
            ),
        ]
        result = orchestrator.run_workflow(steps, initial_context={})

        assert result.success is True


class TestErrorHandling:
    """エラーハンドリングのテスト"""

    def test_agent_execution_error(self):
        """エージェント実行エラーが伝播する"""
        orchestrator = AgentOrchestrator()

        mock_agent = MagicMock()
        mock_agent.run.side_effect = Exception("Agent failed")

        orchestrator.register_agent("failing_agent", mock_agent)

        steps = [WorkflowStep(agent_name="failing_agent")]

        with pytest.raises(OrchestratorError) as exc_info:
            orchestrator.run_workflow(steps, initial_context={})

        assert "failing_agent" in str(exc_info.value)

    def test_workflow_result_on_partial_failure(self):
        """部分的失敗時のワークフロー結果"""
        orchestrator = AgentOrchestrator()

        agent1 = MagicMock()
        output1 = MagicMock()
        output1.model_dump.return_value = {"result": "success"}
        agent1.run.return_value = output1

        agent2 = MagicMock()
        agent2.run.side_effect = Exception("Second agent failed")

        orchestrator.register_agent("agent1", agent1)
        orchestrator.register_agent("agent2", agent2)

        steps = [
            WorkflowStep(agent_name="agent1"),
            WorkflowStep(agent_name="agent2"),
        ]

        with pytest.raises(OrchestratorError) as exc_info:
            orchestrator.run_workflow(steps, initial_context={})

        # エラーには失敗したエージェント名が含まれる
        assert "agent2" in str(exc_info.value)


class TestWorkflowResult:
    """WorkflowResultのテスト"""

    def test_result_contains_all_outputs(self):
        """結果に全エージェントの出力が含まれる"""
        orchestrator = AgentOrchestrator()

        for name in ["agent1", "agent2", "agent3"]:
            agent = MagicMock()
            output = MagicMock()
            output.model_dump.return_value = {f"result_{name}": True}
            agent.run.return_value = output
            orchestrator.register_agent(name, agent)

        steps = [
            WorkflowStep(agent_name="agent1"),
            WorkflowStep(agent_name="agent2"),
            WorkflowStep(agent_name="agent3"),
        ]
        result = orchestrator.run_workflow(steps, initial_context={})

        assert len(result.outputs) == 3
        assert all(name in result.outputs for name in ["agent1", "agent2", "agent3"])

    def test_result_execution_time(self):
        """結果に実行時間が含まれる"""
        orchestrator = AgentOrchestrator()

        mock_agent = MagicMock()
        mock_output = MagicMock()
        mock_output.model_dump.return_value = {}
        mock_agent.run.return_value = mock_output

        orchestrator.register_agent("test", mock_agent)

        steps = [WorkflowStep(agent_name="test")]
        result = orchestrator.run_workflow(steps, initial_context={})

        assert result.execution_time >= 0
