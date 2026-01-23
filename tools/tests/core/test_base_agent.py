"""Tests for BaseAgent ABC class."""

from typing import Any

import pytest
from pydantic import BaseModel, Field
from typing_extensions import TypedDict

from src.core.agents import BaseAgent


class SampleInput(BaseModel):
    """Sample input schema for testing."""

    query: str = Field(description="User query")


class SampleOutput(BaseModel):
    """Sample output schema for testing."""

    answer: str = Field(description="Answer to query")
    confidence: float = Field(default=0.0)


class SampleState(TypedDict):
    """Sample state for testing."""

    input: SampleInput
    answer: str | None
    confidence: float
    retry_count: int


class ConcreteAgent(BaseAgent[SampleState, SampleInput, SampleOutput]):
    """Concrete implementation of BaseAgent for testing."""

    def get_state_class(self) -> type[SampleState]:
        return SampleState

    def create_nodes(self) -> dict[str, Any]:
        def process_node(state: SampleState) -> dict[str, Any]:
            return {
                "answer": f"Answer to: {state['input'].query}",
                "confidence": 0.95,
            }

        return {"process": process_node}

    def define_graph_edges(self, graph: Any) -> None:
        from langgraph.graph import END

        graph.set_entry_point("process")
        graph.add_edge("process", END)

    def create_initial_state(self, input_data: SampleInput) -> SampleState:
        return SampleState(
            input=input_data,
            answer=None,
            confidence=0.0,
            retry_count=0,
        )

    def extract_output(self, final_state: SampleState) -> SampleOutput:
        return SampleOutput(
            answer=final_state["answer"] or "",
            confidence=final_state["confidence"],
        )


class TestBaseAgent:
    """BaseAgent ABC tests."""

    def test_cannot_instantiate_base_agent(self):
        """BaseAgent is abstract and cannot be instantiated."""
        with pytest.raises(TypeError):
            BaseAgent()

    def test_concrete_agent_instantiation(self):
        """Concrete implementation can be instantiated."""
        agent = ConcreteAgent()
        assert agent is not None

    def test_get_state_class(self):
        """get_state_class returns correct state class."""
        agent = ConcreteAgent()
        state_class = agent.get_state_class()
        assert state_class == SampleState

    def test_create_nodes_returns_dict(self):
        """create_nodes returns dictionary of node functions."""
        agent = ConcreteAgent()
        nodes = agent.create_nodes()
        assert isinstance(nodes, dict)
        assert "process" in nodes
        assert callable(nodes["process"])

    def test_create_initial_state(self):
        """create_initial_state creates correct initial state."""
        agent = ConcreteAgent()
        input_data = SampleInput(query="test question")
        state = agent.create_initial_state(input_data)

        assert state["input"] == input_data
        assert state["answer"] is None
        assert state["confidence"] == 0.0
        assert state["retry_count"] == 0

    def test_extract_output(self):
        """extract_output extracts correct output from final state."""
        agent = ConcreteAgent()
        final_state = SampleState(
            input=SampleInput(query="test"),
            answer="Final answer",
            confidence=0.9,
            retry_count=1,
        )
        output = agent.extract_output(final_state)

        assert output.answer == "Final answer"
        assert output.confidence == 0.9


class TestBaseAgentBuildGraph:
    """Tests for BaseAgent.build_graph method."""

    def test_build_graph_creates_compiled_graph(self):
        """build_graph creates a compiled StateGraph."""
        agent = ConcreteAgent()
        graph = agent.build_graph()

        # Compiled graph should be invokable
        assert hasattr(graph, "invoke")

    def test_build_graph_includes_all_nodes(self):
        """build_graph includes all nodes from create_nodes."""
        agent = ConcreteAgent()
        graph = agent.build_graph()

        # Graph should have the process node
        # We can verify by checking if invoke works
        input_data = SampleInput(query="test")
        initial_state = agent.create_initial_state(input_data)
        result = graph.invoke(initial_state)

        assert result["answer"] is not None


class TestBaseAgentRun:
    """Tests for BaseAgent.run method."""

    def test_run_returns_output(self):
        """run method returns correct output."""
        agent = ConcreteAgent()
        input_data = SampleInput(query="What is Python?")

        output = agent.run(input_data)

        assert isinstance(output, SampleOutput)
        assert "What is Python?" in output.answer

    def test_run_with_different_inputs(self):
        """run method handles different inputs correctly."""
        agent = ConcreteAgent()

        output1 = agent.run(SampleInput(query="Question 1"))
        output2 = agent.run(SampleInput(query="Question 2"))

        assert "Question 1" in output1.answer
        assert "Question 2" in output2.answer


class TestBaseAgentWithComplexGraph:
    """Test BaseAgent with more complex graph structures."""

    def test_agent_with_multiple_nodes(self):
        """Agent with multiple nodes works correctly."""

        class MultiNodeAgent(BaseAgent[SampleState, SampleInput, SampleOutput]):
            def get_state_class(self) -> type[SampleState]:
                return SampleState

            def create_nodes(self) -> dict[str, Any]:
                def prepare(state: SampleState) -> dict[str, Any]:
                    return {"confidence": 0.5}

                def process(state: SampleState) -> dict[str, Any]:
                    return {
                        "answer": f"Processed: {state['input'].query}",
                        "confidence": state["confidence"] + 0.3,
                    }

                return {"prepare": prepare, "process": process}

            def define_graph_edges(self, graph: Any) -> None:
                from langgraph.graph import END

                graph.set_entry_point("prepare")
                graph.add_edge("prepare", "process")
                graph.add_edge("process", END)

            def create_initial_state(self, input_data: SampleInput) -> SampleState:
                return SampleState(
                    input=input_data,
                    answer=None,
                    confidence=0.0,
                    retry_count=0,
                )

            def extract_output(self, final_state: SampleState) -> SampleOutput:
                return SampleOutput(
                    answer=final_state["answer"] or "",
                    confidence=final_state["confidence"],
                )

        agent = MultiNodeAgent()
        output = agent.run(SampleInput(query="test"))

        assert "Processed: test" in output.answer
        assert output.confidence == pytest.approx(0.8)


class TestBaseAgentInheritance:
    """Test that BaseAgent can be properly inherited."""

    def test_subclass_can_add_methods(self):
        """Subclasses can add additional methods."""

        class ExtendedAgent(ConcreteAgent):
            def get_version(self) -> str:
                return "1.0.0"

        agent = ExtendedAgent()
        assert agent.get_version() == "1.0.0"
        assert agent.run(SampleInput(query="test")).answer is not None

    def test_subclass_can_override_methods(self):
        """Subclasses can override base methods."""

        class CustomOutputAgent(ConcreteAgent):
            def extract_output(self, final_state: SampleState) -> SampleOutput:
                return SampleOutput(
                    answer=f"Custom: {final_state['answer']}",
                    confidence=1.0,
                )

        agent = CustomOutputAgent()
        output = agent.run(SampleInput(query="test"))

        assert output.answer.startswith("Custom:")
        assert output.confidence == 1.0
