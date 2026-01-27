"""Orchestrator module.

複数のエージェントを連携させてワークフローを実行するオーケストレーター。

Example:
    >>> from src.core.orchestrator import Orchestrator, WorkflowDefinition, WorkflowStep
    >>>
    >>> orchestrator = Orchestrator()
    >>> orchestrator.register_agent("keyword_finder", KeywordFinderAgent())
    >>> orchestrator.register_agent("writer", WriterAgent())
    >>>
    >>> workflow = WorkflowDefinition(
    ...     name="article_generation",
    ...     steps=[
    ...         WorkflowStep(agent_name="keyword_finder", output_key="keywords"),
    ...         WorkflowStep(agent_name="writer", output_key="article"),
    ...     ]
    ... )
    >>> orchestrator.register_workflow(workflow)
    >>>
    >>> result = orchestrator.run_workflow("article_generation", initial_input)
"""

from src.core.orchestrator.orchestrator import (
    AgentNotFoundError,
    Orchestrator,
    OrchestratorError,
    WorkflowNotFoundError,
)
from src.core.orchestrator.schemas import (
    ExecutionContext,
    InputMapper,
    OrchestratorConfig,
    WorkflowDefinition,
    WorkflowStep,
)

__all__ = [
    # Main class
    "Orchestrator",
    # Schemas
    "ExecutionContext",
    "InputMapper",
    "OrchestratorConfig",
    "WorkflowDefinition",
    "WorkflowStep",
    # Errors
    "OrchestratorError",
    "AgentNotFoundError",
    "WorkflowNotFoundError",
]
