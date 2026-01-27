"""Orchestrator tests."""

from typing import Any
from unittest.mock import MagicMock

import pytest

from src.core.orchestrator import (
    AgentNotFoundError,
    ExecutionContext,
    Orchestrator,
    WorkflowDefinition,
    WorkflowNotFoundError,
    WorkflowStep,
)


class TestOrchestratorInit:
    """Orchestrator initialization tests."""

    def test_create_default(self):
        """デフォルトで作成できる."""
        orchestrator = Orchestrator()
        assert orchestrator.agents == {}
        assert orchestrator.workflows == {}

    def test_agents_property_returns_copy(self):
        """agentsプロパティはコピーを返す."""
        orchestrator = Orchestrator()
        agents = orchestrator.agents
        agents["test"] = MagicMock()
        assert "test" not in orchestrator.agents


class TestOrchestratorRegisterAgent:
    """Agent registration tests."""

    def test_register_agent(self):
        """エージェントを登録できる."""
        orchestrator = Orchestrator()
        mock_agent = MagicMock()

        orchestrator.register_agent("test_agent", mock_agent)

        assert "test_agent" in orchestrator.agents
        assert orchestrator.agents["test_agent"] == mock_agent

    def test_register_multiple_agents(self):
        """複数のエージェントを登録できる."""
        orchestrator = Orchestrator()
        agent1 = MagicMock()
        agent2 = MagicMock()

        orchestrator.register_agent("agent1", agent1)
        orchestrator.register_agent("agent2", agent2)

        assert len(orchestrator.agents) == 2


class TestOrchestratorRegisterWorkflow:
    """Workflow registration tests."""

    def test_register_workflow(self):
        """ワークフローを登録できる."""
        orchestrator = Orchestrator()
        workflow = WorkflowDefinition(name="test_workflow")

        orchestrator.register_workflow(workflow)

        assert "test_workflow" in orchestrator.workflows


class TestOrchestratorRunWorkflow:
    """Workflow execution tests."""

    def test_run_workflow_not_found(self):
        """存在しないワークフローはエラー."""
        orchestrator = Orchestrator()

        with pytest.raises(WorkflowNotFoundError):
            orchestrator.run_workflow("nonexistent")

    def test_run_workflow_no_name(self):
        """ワークフロー名なしはエラー."""
        orchestrator = Orchestrator()

        with pytest.raises(WorkflowNotFoundError):
            orchestrator.run_workflow()

    def test_run_workflow_agent_not_found(self):
        """存在しないエージェントはエラー."""
        orchestrator = Orchestrator()
        workflow = WorkflowDefinition(
            name="test",
            steps=[WorkflowStep(agent_name="nonexistent", output_key="result")],
        )
        orchestrator.register_workflow(workflow)

        with pytest.raises(AgentNotFoundError):
            orchestrator.run_workflow("test")

    def test_run_workflow_single_step(self):
        """1ステップのワークフローを実行できる."""
        orchestrator = Orchestrator()

        # モックエージェント
        mock_agent = MagicMock()
        mock_agent.run.return_value = {"output": "test_result"}
        orchestrator.register_agent("test_agent", mock_agent)

        # ワークフロー登録
        workflow = WorkflowDefinition(
            name="test",
            steps=[WorkflowStep(agent_name="test_agent", output_key="result")],
        )
        orchestrator.register_workflow(workflow)

        # 実行
        initial_input = {"input": "test"}
        ctx = orchestrator.run_workflow("test", initial_input=initial_input)

        # 検証
        mock_agent.run.assert_called_once()
        assert ctx.get("result") == {"output": "test_result"}

    def test_run_workflow_multiple_steps(self):
        """複数ステップのワークフローを実行できる."""
        orchestrator = Orchestrator()

        # モックエージェント
        agent1 = MagicMock()
        agent1.run.return_value = {"step1": "done"}
        agent2 = MagicMock()
        agent2.run.return_value = {"step2": "done"}

        orchestrator.register_agent("agent1", agent1)
        orchestrator.register_agent("agent2", agent2)

        # ワークフロー登録
        workflow = WorkflowDefinition(
            name="test",
            steps=[
                WorkflowStep(agent_name="agent1", output_key="result1"),
                WorkflowStep(agent_name="agent2", output_key="result2"),
            ],
        )
        orchestrator.register_workflow(workflow)

        # 実行
        ctx = orchestrator.run_workflow("test", initial_input={"start": True})

        # 検証
        assert agent1.run.call_count == 1
        assert agent2.run.call_count == 1
        assert ctx.get("result1") == {"step1": "done"}
        assert ctx.get("result2") == {"step2": "done"}


class TestOrchestratorInputMapper:
    """Input mapper tests."""

    def test_register_input_mapper(self):
        """入力マッパーを登録できる."""
        orchestrator = Orchestrator()

        def custom_mapper(ctx: ExecutionContext) -> Any:
            return ctx.get("custom_key")

        orchestrator.register_input_mapper("custom", custom_mapper)

        # 内部でマッパーが登録されていることを確認
        # （直接アクセスできないので、ワークフロー実行で間接的に確認）
        mock_agent = MagicMock()
        mock_agent.run.return_value = {"done": True}
        orchestrator.register_agent("agent", mock_agent)

        workflow = WorkflowDefinition(
            name="test",
            steps=[
                WorkflowStep(
                    agent_name="agent", output_key="result", input_mapper="custom"
                )
            ],
        )
        orchestrator.register_workflow(workflow)

        ctx = ExecutionContext(data={"custom_key": {"mapped": "input"}})
        orchestrator.run_workflow("test", context=ctx)

        # マッパーを通じて正しい入力が渡されたことを確認
        mock_agent.run.assert_called_once_with({"mapped": "input"})
