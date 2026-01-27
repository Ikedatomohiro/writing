"""Orchestrator schema tests."""

import pytest

from src.core.orchestrator.schemas import (
    ExecutionContext,
    OrchestratorConfig,
    WorkflowDefinition,
    WorkflowStep,
)


class TestWorkflowStep:
    """WorkflowStep tests."""

    def test_create_with_required_fields(self):
        """必須フィールドのみで作成できる."""
        step = WorkflowStep(agent_name="test_agent", output_key="result")
        assert step.agent_name == "test_agent"
        assert step.output_key == "result"
        assert step.input_mapper is None

    def test_create_with_input_mapper(self):
        """入力マッパー付きで作成できる."""
        step = WorkflowStep(
            agent_name="test_agent",
            output_key="result",
            input_mapper="custom_mapper",
        )
        assert step.input_mapper == "custom_mapper"


class TestWorkflowDefinition:
    """WorkflowDefinition tests."""

    def test_create_with_name(self):
        """名前のみで作成できる."""
        workflow = WorkflowDefinition(name="test_workflow")
        assert workflow.name == "test_workflow"
        assert workflow.description == ""
        assert workflow.steps == []

    def test_create_with_steps(self):
        """ステップ付きで作成できる."""
        steps = [
            WorkflowStep(agent_name="agent1", output_key="result1"),
            WorkflowStep(agent_name="agent2", output_key="result2"),
        ]
        workflow = WorkflowDefinition(name="test_workflow", steps=steps)
        assert len(workflow.steps) == 2


class TestExecutionContext:
    """ExecutionContext tests."""

    def test_create_empty(self):
        """空のコンテキストを作成できる."""
        ctx = ExecutionContext()
        assert ctx.data == {}
        assert ctx.metadata == {}

    def test_get_set(self):
        """データの取得・設定ができる."""
        ctx = ExecutionContext()
        ctx.set("key", "value")
        assert ctx.get("key") == "value"

    def test_get_default(self):
        """存在しないキーはデフォルト値を返す."""
        ctx = ExecutionContext()
        assert ctx.get("nonexistent") is None
        assert ctx.get("nonexistent", "default") == "default"

    def test_merge(self):
        """データをマージできる."""
        ctx = ExecutionContext(data={"a": 1})
        new_ctx = ctx.merge({"b": 2})
        assert new_ctx.data == {"a": 1, "b": 2}
        # 元のコンテキストは変更されない
        assert ctx.data == {"a": 1}


class TestOrchestratorConfig:
    """OrchestratorConfig tests."""

    def test_create_default(self):
        """デフォルト設定で作成できる."""
        config = OrchestratorConfig()
        assert config.name == "default"
        assert config.workflows == {}
        assert config.default_workflow is None

    def test_create_with_workflows(self):
        """ワークフロー付きで作成できる."""
        workflow = WorkflowDefinition(name="test")
        config = OrchestratorConfig(
            name="custom",
            workflows={"test": workflow},
            default_workflow="test",
        )
        assert config.name == "custom"
        assert "test" in config.workflows
        assert config.default_workflow == "test"
