"""Base schema definitions for agent framework.

These classes provide common schemas that can be extended by specific agents.
"""

from typing import Any

from pydantic import BaseModel, Field


class BaseReflection(BaseModel):
    """Base class for reflection results.

    Used by agents to evaluate whether their current results are sufficient
    or if additional work is needed.
    """

    is_sufficient: bool = Field(description="Whether the results are sufficient")
    feedback: str = Field(description="Feedback or improvement suggestions")


class BaseToolResult(BaseModel):
    """Base class for tool execution results.

    Stores the result of executing a tool during agent execution.
    """

    tool_name: str = Field(description="Name of the tool")
    query: str = Field(description="Query or input that was executed")
    results: list[Any] = Field(description="Execution results")


class BasePlan(BaseModel):
    """Base class for execution plans.

    Defines the steps an agent should take to complete its task.
    """

    steps: list[str] = Field(description="Execution steps")
