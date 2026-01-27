"""Orchestrator for multi-agent workflow execution.

This module provides the AgentOrchestrator class for coordinating
multiple agents in a sequential workflow.

Example usage:
    orchestrator = AgentOrchestrator()
    orchestrator.register_agent("keyword_finder", KeywordFinderAgent())
    orchestrator.register_agent("evaluator", EvaluatorAgent())

    steps = [
        WorkflowStep(agent_name="keyword_finder"),
        WorkflowStep(
            agent_name="evaluator",
            input_mapping={"keywords": "keyword_finder.keywords"},
        ),
    ]
    result = orchestrator.run_workflow(steps, initial_context={"category": "tech"})
"""

import time
from dataclasses import dataclass, field
from typing import Any


class OrchestratorError(Exception):
    """Base exception for orchestrator errors."""

    pass


class AgentNotFoundError(OrchestratorError):
    """Raised when an agent is not found in the registry."""

    pass


@dataclass
class WorkflowStep:
    """Defines a single step in a workflow.

    Attributes:
        agent_name: The name of the agent to execute
        input_mapping: Maps input fields to context paths (e.g., {"keywords": "finder.keywords"})
        output_key: Key to store the output in context (defaults to agent_name)
    """

    agent_name: str
    input_mapping: dict[str, str] = field(default_factory=dict)
    output_key: str | None = None

    def __post_init__(self) -> None:
        if self.output_key is None:
            self.output_key = self.agent_name


@dataclass
class WorkflowResult:
    """Result of a workflow execution.

    Attributes:
        success: Whether the workflow completed successfully
        outputs: Dictionary of agent outputs keyed by agent name
        context: The final context after all steps
        execution_time: Total execution time in seconds
        error: Error message if workflow failed
    """

    success: bool
    outputs: dict[str, Any]
    context: dict[str, Any]
    execution_time: float
    error: str | None = None


class AgentOrchestrator:
    """Orchestrates multiple agents in a workflow.

    The orchestrator manages agent registration and executes workflows
    by running agents in sequence, passing context between them.

    Example:
        >>> orchestrator = AgentOrchestrator()
        >>> orchestrator.register_agent("finder", KeywordFinderAgent())
        >>> steps = [WorkflowStep(agent_name="finder")]
        >>> result = orchestrator.run_workflow(steps, {"category": "tech"})
    """

    def __init__(self) -> None:
        """Initialize the orchestrator with an empty agent registry."""
        self._agents: dict[str, Any] = {}

    def register_agent(self, name: str, agent: Any) -> None:
        """Register an agent with the given name.

        Args:
            name: Unique identifier for the agent
            agent: The agent instance (must have a run() method)
        """
        self._agents[name] = agent

    def list_agents(self) -> list[str]:
        """List all registered agent names.

        Returns:
            List of agent names
        """
        return list(self._agents.keys())

    def get_agent(self, name: str) -> Any:
        """Get an agent by name.

        Args:
            name: The agent name

        Returns:
            The agent instance

        Raises:
            AgentNotFoundError: If agent is not registered
        """
        if name not in self._agents:
            raise AgentNotFoundError(f"Agent '{name}' not found in registry")
        return self._agents[name]

    def run_workflow(
        self,
        steps: list[WorkflowStep],
        initial_context: dict[str, Any],
    ) -> WorkflowResult:
        """Execute a workflow with the given steps.

        Args:
            steps: List of workflow steps to execute in order
            initial_context: Initial context data

        Returns:
            WorkflowResult containing outputs and final context

        Raises:
            AgentNotFoundError: If a step references an unregistered agent
            OrchestratorError: If an agent fails during execution
        """
        start_time = time.time()
        context = dict(initial_context)
        outputs: dict[str, Any] = {}

        # Validate all agents exist before executing
        for step in steps:
            if step.agent_name not in self._agents:
                raise AgentNotFoundError(
                    f"Agent '{step.agent_name}' not found in registry"
                )

        for step in steps:
            agent = self._agents[step.agent_name]

            # Build input from mapping
            agent_input = self._build_agent_input(step, context)

            try:
                # Run the agent
                output = agent.run(agent_input)

                # Convert output to dict if it has model_dump
                if hasattr(output, "model_dump"):
                    output_dict = output.model_dump()
                else:
                    output_dict = dict(output) if output else {}

                # Store output
                outputs[step.agent_name] = output_dict
                context[step.output_key] = output_dict

            except Exception as e:
                execution_time = time.time() - start_time
                raise OrchestratorError(
                    f"Agent '{step.agent_name}' failed: {e}"
                ) from e

        execution_time = time.time() - start_time
        return WorkflowResult(
            success=True,
            outputs=outputs,
            context=context,
            execution_time=execution_time,
        )

    def _build_agent_input(
        self,
        step: WorkflowStep,
        context: dict[str, Any],
    ) -> Any:
        """Build agent input from mapping and context.

        Args:
            step: The workflow step
            context: Current context

        Returns:
            Input for the agent (dict or Pydantic model)
        """
        if not step.input_mapping:
            return context

        result = {}
        for target_key, source_path in step.input_mapping.items():
            value = self._resolve_path(source_path, context)
            result[target_key] = value

        return result

    def _resolve_path(self, path: str, context: dict[str, Any]) -> Any:
        """Resolve a dot-notation path in the context.

        Args:
            path: Path like "agent1.keywords" or "context.category"
            context: The context to resolve from

        Returns:
            The value at the path
        """
        parts = path.split(".")

        # Handle "context.xxx" prefix
        if parts[0] == "context":
            parts = parts[1:]

        current = context
        for part in parts:
            if isinstance(current, dict):
                current = current.get(part)
            else:
                current = getattr(current, part, None)

            if current is None:
                break

        return current
