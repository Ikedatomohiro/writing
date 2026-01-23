"""Base node class for agent framework.

Provides an abstract base class for creating nodes in a LangGraph workflow.
"""

from abc import ABC, abstractmethod
from typing import Any, Generic, TypeVar

from langchain_core.messages import HumanMessage, SystemMessage
from pydantic import BaseModel, Field

from src.models import get_structured_model

TState = TypeVar("TState")
TOutput = TypeVar("TOutput", bound=BaseModel)


class PromptConfig(BaseModel):
    """Configuration for node prompts."""

    system_prompt: str = Field(description="System prompt for the LLM")
    user_prompt_template: str = Field(
        description="User prompt template with placeholders"
    )


class BaseNode(ABC, Generic[TState, TOutput]):
    """Abstract base class for LangGraph nodes.

    Provides a common structure for nodes that:
    1. Extract variables from state
    2. Format prompts
    3. Call LLM with structured output
    4. Update state with results

    Type Parameters:
        TState: The type of the agent state
        TOutput: The Pydantic model for structured output
    """

    def __init__(self, prompt_config: PromptConfig, output_schema: type[TOutput]):
        """Initialize the node.

        Args:
            prompt_config: Configuration for system and user prompts
            output_schema: Pydantic model class for structured output
        """
        self.prompt_config = prompt_config
        self.output_schema = output_schema

    @abstractmethod
    def extract_prompt_variables(self, state: TState) -> dict[str, Any]:
        """Extract variables from state for prompt formatting.

        Args:
            state: Current agent state

        Returns:
            Dictionary of variables to format the user prompt
        """
        ...

    @abstractmethod
    def update_state(self, state: TState, output: TOutput) -> dict[str, Any]:
        """Create state updates from the LLM output.

        Args:
            state: Current agent state
            output: Structured output from LLM

        Returns:
            Dictionary of state updates
        """
        ...

    def should_skip(self, state: TState) -> bool:
        """Determine if this node should be skipped.

        Override this method to implement conditional execution.

        Args:
            state: Current agent state

        Returns:
            True if the node should be skipped, False otherwise
        """
        return False

    def __call__(self, state: TState) -> dict[str, Any]:
        """Execute the node (LangGraph compatible).

        Args:
            state: Current agent state

        Returns:
            Dictionary of state updates
        """
        if self.should_skip(state):
            return {}

        variables = self.extract_prompt_variables(state)
        user_prompt = self.prompt_config.user_prompt_template.format(**variables)

        messages = [
            SystemMessage(content=self.prompt_config.system_prompt),
            HumanMessage(content=user_prompt),
        ]

        model = get_structured_model(self.output_schema)
        output = model.invoke(messages)

        return self.update_state(state, output)
