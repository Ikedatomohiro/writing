"""Writer agent state schema."""

from typing import TypedDict

from langchain_core.messages import BaseMessage

from src.agents.writer.schemas.angle import AngleProposalList, AngleSelection
from src.agents.writer.schemas.input import WriterInput
from src.agents.writer.schemas.output import (
    ArticlePlan,
    ReflectionResult,
    Section,
    WriterOutput,
)


class AgentState(TypedDict):
    """Writer agent state"""

    input: WriterInput
    messages: list[BaseMessage]
    angle_proposals: AngleProposalList | None
    selected_angle: AngleSelection | None
    plan: ArticlePlan | None
    sections: list[Section]
    reflection: ReflectionResult | None
    retry_count: int
    output: WriterOutput | None
