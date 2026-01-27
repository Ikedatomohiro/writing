"""Writer agent prompts."""

from src.agents.writer.prompts.angle_proposal import ANGLE_PROPOSAL_PROMPT_CONFIG
from src.agents.writer.prompts.angle_selection import ANGLE_SELECTION_PROMPT_CONFIG
from src.agents.writer.prompts.executor import EXECUTOR_PROMPT_CONFIG
from src.agents.writer.prompts.integrator import INTEGRATOR_PROMPT_CONFIG
from src.agents.writer.prompts.planner import PLANNER_PROMPT_CONFIG
from src.agents.writer.prompts.reflector import REFLECTOR_PROMPT_CONFIG

__all__ = [
    "ANGLE_PROPOSAL_PROMPT_CONFIG",
    "ANGLE_SELECTION_PROMPT_CONFIG",
    "PLANNER_PROMPT_CONFIG",
    "EXECUTOR_PROMPT_CONFIG",
    "REFLECTOR_PROMPT_CONFIG",
    "INTEGRATOR_PROMPT_CONFIG",
]
