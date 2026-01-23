"""Retry utilities for agent framework.

Provides configuration and helper functions for implementing retry logic
in agent reflection loops.
"""

from dataclasses import dataclass
from typing import Any, Callable

from src.core.schemas import BaseReflection


@dataclass
class RetryConfig:
    """Configuration for retry logic.

    Attributes:
        max_retries: Maximum number of retry attempts
        continue_node: Name of the node to continue to when retrying
        finish_node: Name of the node to transition to when finished
    """

    max_retries: int = 5
    continue_node: str = "execute"
    finish_node: str = "integrate"


def create_should_continue(config: RetryConfig) -> Callable[[dict[str, Any]], str]:
    """Create a should_continue function for LangGraph conditional edges.

    The returned function checks the reflection result and retry count
    to determine whether to continue retrying or finish.

    Args:
        config: Retry configuration

    Returns:
        A function that takes state and returns the next node name
    """

    def should_continue(state: dict[str, Any]) -> str:
        """Determine whether to continue or finish.

        Args:
            state: Current agent state containing 'reflection' and 'retry_count'

        Returns:
            Name of the next node to execute
        """
        reflection: BaseReflection | None = state.get("reflection")
        retry_count: int = state.get("retry_count", 0)

        # If reflection indicates sufficient results, finish
        if reflection and reflection.is_sufficient:
            return config.finish_node

        # If max retries reached, finish regardless
        if retry_count >= config.max_retries:
            return config.finish_node

        # Otherwise, continue retrying
        return config.continue_node

    return should_continue
