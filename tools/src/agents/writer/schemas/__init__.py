"""Writer agent schemas."""

from src.agents.writer.schemas.angle import (
    AngleProposal,
    AngleProposalList,
    AngleSelection,
)
from src.agents.writer.schemas.input import WriterInput
from src.agents.writer.schemas.output import (
    ArticlePlan,
    PlannedSection,
    ReflectionResult,
    Section,
    WriterOutput,
)
from src.agents.writer.schemas.state import AgentState

__all__ = [
    "AngleProposal",
    "AngleProposalList",
    "AngleSelection",
    "WriterInput",
    "WriterOutput",
    "Section",
    "PlannedSection",
    "ArticlePlan",
    "ReflectionResult",
    "AgentState",
]
