"""Writer agent prompts."""

from src.agents.writer.prompts.executor import EXECUTOR_PROMPT_CONFIG
from src.agents.writer.prompts.integrator import INTEGRATOR_PROMPT_CONFIG
from src.agents.writer.prompts.planner import PLANNER_PROMPT_CONFIG
from src.agents.writer.prompts.reflector import REFLECTOR_PROMPT_CONFIG

__all__ = [
    "PLANNER_PROMPT_CONFIG",
    "EXECUTOR_PROMPT_CONFIG",
    "REFLECTOR_PROMPT_CONFIG",
    "INTEGRATOR_PROMPT_CONFIG",
]
