"""Writer agent prompts."""

from src.agents.writer.prompts.angle_proposal import ANGLE_PROPOSAL_PROMPT_CONFIG
from src.agents.writer.prompts.angle_selection import ANGLE_SELECTION_PROMPT_CONFIG
from src.agents.writer.prompts.executor import EXECUTOR_PROMPT_CONFIG
from src.agents.writer.prompts.integrator import INTEGRATOR_PROMPT_CONFIG
from src.agents.writer.prompts.planner import PLANNER_PROMPT_CONFIG
from src.agents.writer.prompts.reflector import REFLECTOR_PROMPT_CONFIG
from src.agents.writer.prompts.researcher import (
    QUERY_GENERATOR_PROMPT_CONFIG as RESEARCHER_QUERY_PROMPT_CONFIG,
    RESEARCH_SUMMARIZER_PROMPT_CONFIG as RESEARCHER_SUMMARIZER_PROMPT_CONFIG,
)
from src.agents.writer.prompts.image_suggestion import (
    IMAGE_SUGGESTION_PROMPT_CONFIG,
)
from src.agents.writer.prompts.seo_optimizer import SEO_OPTIMIZER_PROMPT_CONFIG

__all__ = [
    "ANGLE_PROPOSAL_PROMPT_CONFIG",
    "ANGLE_SELECTION_PROMPT_CONFIG",
    "PLANNER_PROMPT_CONFIG",
    "EXECUTOR_PROMPT_CONFIG",
    "REFLECTOR_PROMPT_CONFIG",
    "INTEGRATOR_PROMPT_CONFIG",
    "RESEARCHER_QUERY_PROMPT_CONFIG",
    "RESEARCHER_SUMMARIZER_PROMPT_CONFIG",
    "SEO_OPTIMIZER_PROMPT_CONFIG",
    "IMAGE_SUGGESTION_PROMPT_CONFIG",
]
