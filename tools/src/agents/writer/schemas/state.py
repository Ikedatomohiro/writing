"""Writer agent state schema."""

from typing import TypedDict

from langchain_core.messages import BaseMessage

from src.agents.writer.schemas.angle import AngleProposalList, AngleSelection
from src.agents.writer.schemas.image import ImageSuggestions
from src.agents.writer.schemas.input import WriterInput
from src.agents.writer.schemas.output import (
    ArticlePlan,
    ReflectionResult,
    Section,
    WriterOutput,
)
from src.agents.writer.schemas.persona import PersonaConfig
from src.agents.writer.schemas.research import ResearchResult


class AgentState(TypedDict):
    """Writer agent state"""

    input: WriterInput
    messages: list[BaseMessage]
    angle_proposals: AngleProposalList | None
    selected_angle: AngleSelection | None
    research_result: ResearchResult | None
    plan: ArticlePlan | None
    sections: list[Section]
    reflection: ReflectionResult | None
    retry_count: int
    output: WriterOutput | None
    persona: PersonaConfig | None
    image_suggestions: ImageSuggestions | None
