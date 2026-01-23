"""Tests for BaseNode ABC class."""

from typing import Any, TypedDict
from unittest.mock import MagicMock, patch

import pytest
from pydantic import BaseModel, Field

from src.core.nodes import BaseNode, PromptConfig


class SampleOutput(BaseModel):
    """Sample output schema for testing."""

    result: str = Field(description="Result text")
    score: int = Field(default=0, description="Score")


class SampleState:
    """Sample state for testing."""

    def __init__(self, query: str, context: str = ""):
        self.query = query
        self.context = context

    def __getitem__(self, key: str) -> Any:
        return getattr(self, key)

    def get(self, key: str, default: Any = None) -> Any:
        return getattr(self, key, default)


class ConcreteNode(BaseNode[dict[str, Any], SampleOutput]):
    """Concrete implementation of BaseNode for testing."""

    def extract_prompt_variables(self, state: dict[str, Any]) -> dict[str, Any]:
        return {
            "query": state.get("query", ""),
            "context": state.get("context", ""),
        }

    def update_state(
        self, state: dict[str, Any], output: SampleOutput
    ) -> dict[str, Any]:
        return {
            "result": output.result,
            "score": output.score,
        }


class TestPromptConfig:
    """PromptConfig tests."""

    def test_valid_prompt_config(self):
        """Create valid PromptConfig."""
        config = PromptConfig(
            system_prompt="You are a helpful assistant.",
            user_prompt_template="Question: {query}",
        )
        assert config.system_prompt == "You are a helpful assistant."
        assert "{query}" in config.user_prompt_template

    def test_prompt_config_is_immutable(self):
        """PromptConfig should be a Pydantic model."""
        config = PromptConfig(
            system_prompt="test",
            user_prompt_template="test",
        )
        assert hasattr(config, "model_dump")


class TestBaseNode:
    """BaseNode ABC tests."""

    def test_cannot_instantiate_base_node(self):
        """BaseNode is abstract and cannot be instantiated."""
        config = PromptConfig(
            system_prompt="test",
            user_prompt_template="test",
        )
        with pytest.raises(TypeError):
            BaseNode(prompt_config=config, output_schema=SampleOutput)

    def test_concrete_node_instantiation(self):
        """Concrete implementation can be instantiated."""
        config = PromptConfig(
            system_prompt="You are a helpful assistant.",
            user_prompt_template="Query: {query}\nContext: {context}",
        )
        node = ConcreteNode(prompt_config=config, output_schema=SampleOutput)
        assert node.prompt_config == config
        assert node.output_schema == SampleOutput

    def test_extract_prompt_variables(self):
        """extract_prompt_variables returns correct variables."""
        config = PromptConfig(
            system_prompt="test",
            user_prompt_template="Query: {query}",
        )
        node = ConcreteNode(prompt_config=config, output_schema=SampleOutput)

        state = {"query": "test query", "context": "test context"}
        variables = node.extract_prompt_variables(state)

        assert variables["query"] == "test query"
        assert variables["context"] == "test context"

    def test_update_state(self):
        """update_state returns correct state updates."""
        config = PromptConfig(
            system_prompt="test",
            user_prompt_template="test",
        )
        node = ConcreteNode(prompt_config=config, output_schema=SampleOutput)

        output = SampleOutput(result="success", score=100)
        updates = node.update_state({}, output)

        assert updates["result"] == "success"
        assert updates["score"] == 100

    def test_should_skip_default_false(self):
        """should_skip returns False by default."""
        config = PromptConfig(
            system_prompt="test",
            user_prompt_template="test",
        )
        node = ConcreteNode(prompt_config=config, output_schema=SampleOutput)

        assert node.should_skip({}) is False

    def test_should_skip_can_be_overridden(self):
        """should_skip can be overridden in subclass."""

        class SkippableNode(ConcreteNode):
            def should_skip(self, state: dict[str, Any]) -> bool:
                return state.get("skip", False)

        config = PromptConfig(
            system_prompt="test",
            user_prompt_template="test",
        )
        node = SkippableNode(prompt_config=config, output_schema=SampleOutput)

        assert node.should_skip({"skip": False}) is False
        assert node.should_skip({"skip": True}) is True


class TestBaseNodeCall:
    """Tests for BaseNode.__call__ method."""

    @patch("src.models.get_structured_model")
    def test_call_returns_state_updates(self, mock_get_model):
        """__call__ returns state updates from update_state."""
        mock_model = MagicMock()
        mock_model.invoke.return_value = SampleOutput(result="test result", score=50)
        mock_get_model.return_value = mock_model

        config = PromptConfig(
            system_prompt="System prompt",
            user_prompt_template="Query: {query}",
        )
        node = ConcreteNode(prompt_config=config, output_schema=SampleOutput)

        state = {"query": "test query", "context": ""}
        result = node(state)

        assert result["result"] == "test result"
        assert result["score"] == 50

    @patch("src.models.get_structured_model")
    def test_call_formats_user_prompt(self, mock_get_model):
        """__call__ formats user prompt with extracted variables."""
        mock_model = MagicMock()
        mock_model.invoke.return_value = SampleOutput(result="ok", score=0)
        mock_get_model.return_value = mock_model

        config = PromptConfig(
            system_prompt="System",
            user_prompt_template="Query: {query}, Context: {context}",
        )
        node = ConcreteNode(prompt_config=config, output_schema=SampleOutput)

        state = {"query": "my question", "context": "my context"}
        node(state)

        call_args = mock_model.invoke.call_args[0][0]
        user_message = call_args[1].content
        assert "my question" in user_message
        assert "my context" in user_message

    @patch("src.models.get_structured_model")
    def test_call_skips_when_should_skip_true(self, mock_get_model):
        """__call__ returns empty dict when should_skip returns True."""

        class SkippableNode(ConcreteNode):
            def should_skip(self, state: dict[str, Any]) -> bool:
                return True

        config = PromptConfig(
            system_prompt="test",
            user_prompt_template="test",
        )
        node = SkippableNode(prompt_config=config, output_schema=SampleOutput)

        result = node({})

        assert result == {}
        mock_get_model.assert_not_called()


class TypedDictState(TypedDict):
    """TypedDict state for testing LangGraph compatibility."""

    query: str
    context: str


class TypedDictNode(BaseNode[TypedDictState, SampleOutput]):
    """Concrete implementation using TypedDict state."""

    def extract_prompt_variables(self, state: TypedDictState) -> dict[str, Any]:
        return {
            "query": state["query"],
            "context": state["context"],
        }

    def update_state(
        self, state: TypedDictState, output: SampleOutput
    ) -> dict[str, Any]:
        return {
            "result": output.result,
            "score": output.score,
        }


class TestBaseNodeWithTypedDict:
    """Tests for BaseNode with TypedDict state (LangGraph pattern)."""

    def test_typed_dict_node_instantiation(self):
        """TypedDict-based node can be instantiated."""
        config = PromptConfig(
            system_prompt="You are a helpful assistant.",
            user_prompt_template="Query: {query}\nContext: {context}",
        )
        node = TypedDictNode(prompt_config=config, output_schema=SampleOutput)
        assert node.prompt_config == config
        assert node.output_schema == SampleOutput

    def test_extract_prompt_variables_with_typed_dict(self):
        """extract_prompt_variables works with TypedDict state."""
        config = PromptConfig(
            system_prompt="test",
            user_prompt_template="Query: {query}",
        )
        node = TypedDictNode(prompt_config=config, output_schema=SampleOutput)

        state: TypedDictState = {"query": "test query", "context": "test context"}
        variables = node.extract_prompt_variables(state)

        assert variables["query"] == "test query"
        assert variables["context"] == "test context"

    @patch("src.models.get_structured_model")
    def test_call_with_typed_dict_state(self, mock_get_model):
        """__call__ works correctly with TypedDict state."""
        mock_model = MagicMock()
        mock_model.invoke.return_value = SampleOutput(result="success", score=100)
        mock_get_model.return_value = mock_model

        config = PromptConfig(
            system_prompt="System prompt",
            user_prompt_template="Query: {query}",
        )
        node = TypedDictNode(prompt_config=config, output_schema=SampleOutput)

        state: TypedDictState = {"query": "test query", "context": ""}
        result = node(state)

        assert result["result"] == "success"
        assert result["score"] == 100


class TestModelFactoryInjection:
    """Tests for model_factory dependency injection."""

    def test_custom_model_factory_injection(self):
        """Custom model_factory can be injected."""
        mock_model = MagicMock()
        mock_model.invoke.return_value = SampleOutput(result="injected", score=42)
        mock_factory = MagicMock(return_value=mock_model)

        config = PromptConfig(
            system_prompt="System prompt",
            user_prompt_template="Query: {query}",
        )
        node = ConcreteNode(
            prompt_config=config,
            output_schema=SampleOutput,
            model_factory=mock_factory,
        )

        state = {"query": "test query", "context": ""}
        result = node(state)

        assert result["result"] == "injected"
        assert result["score"] == 42
        mock_factory.assert_called_once_with(SampleOutput)

    def test_model_factory_not_called_when_skip(self):
        """Custom model_factory is not called when node is skipped."""

        class SkippableNode(ConcreteNode):
            def should_skip(self, state: dict[str, Any]) -> bool:
                return True

        mock_factory = MagicMock()

        config = PromptConfig(
            system_prompt="test",
            user_prompt_template="test",
        )
        node = SkippableNode(
            prompt_config=config,
            output_schema=SampleOutput,
            model_factory=mock_factory,
        )

        result = node({})

        assert result == {}
        mock_factory.assert_not_called()
