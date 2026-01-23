"""Base agent class for agent framework.

Provides an abstract base class for creating LangGraph-based agents.
"""

from abc import ABC, abstractmethod
from typing import Any, Generic, TypeVar

from langgraph.graph import StateGraph

TState = TypeVar("TState")
TInput = TypeVar("TInput")
TOutput = TypeVar("TOutput")


class BaseAgent(ABC, Generic[TState, TInput, TOutput]):
    """Abstract base class for LangGraph agents.

    Provides a common structure for agents that:
    1. Define a state class
    2. Create nodes for the graph
    3. Define graph edges
    4. Create initial state from input
    5. Extract output from final state

    Type Parameters:
        TState: The type of the agent state (typically a TypedDict)
        TInput: The Pydantic model for input
        TOutput: The Pydantic model for output
    """

    @abstractmethod
    def get_state_class(self) -> type[TState]:
        """Return the state class for this agent.

        Returns:
            The TypedDict class used for agent state
        """
        ...

    @abstractmethod
    def create_nodes(self) -> dict[str, Any]:
        """Create the nodes for the agent graph.

        Returns:
            Dictionary mapping node names to node functions
        """
        ...

    @abstractmethod
    def define_graph_edges(self, graph: StateGraph) -> None:
        """Define edges for the agent graph.

        This method should call graph methods like:
        - graph.set_entry_point(node_name)
        - graph.add_edge(from_node, to_node)
        - graph.add_conditional_edges(...)

        Args:
            graph: The StateGraph to add edges to
        """
        ...

    @abstractmethod
    def create_initial_state(self, input_data: TInput) -> TState:
        """Create the initial state from input data.

        Args:
            input_data: The input to the agent

        Returns:
            Initial state for the agent
        """
        ...

    @abstractmethod
    def extract_output(self, final_state: TState) -> TOutput:
        """Extract the output from the final state.

        Args:
            final_state: The final state after graph execution

        Returns:
            The agent's output
        """
        ...

    def build_graph(self) -> Any:
        """Build and compile the agent graph.

        Returns:
            Compiled StateGraph ready for execution
        """
        state_class = self.get_state_class()
        graph = StateGraph(state_class)

        # Add all nodes
        nodes = self.create_nodes()
        for node_name, node_func in nodes.items():
            graph.add_node(node_name, node_func)

        # Define edges
        self.define_graph_edges(graph)

        return graph.compile()

    def run(self, input_data: TInput) -> TOutput:
        """Run the agent with the given input.

        Args:
            input_data: The input to the agent

        Returns:
            The agent's output
        """
        graph = self.build_graph()
        initial_state = self.create_initial_state(input_data)
        final_state = graph.invoke(initial_state)
        return self.extract_output(final_state)
