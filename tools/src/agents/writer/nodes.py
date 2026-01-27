"""Writer agent nodes.

BaseNode を継承したノードクラスの定義。
"""

from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage

from src.agents.writer.prompts import (
    ANGLE_PROPOSAL_PROMPT_CONFIG,
    ANGLE_SELECTION_PROMPT_CONFIG,
    EXECUTOR_PROMPT_CONFIG,
    INTEGRATOR_PROMPT_CONFIG,
    PLANNER_PROMPT_CONFIG,
    REFLECTOR_PROMPT_CONFIG,
)
from src.agents.writer.schemas import (
    AgentState,
    AngleProposalList,
    AngleSelection,
    ArticlePlan,
    ReflectionResult,
    Section,
    WriterOutput,
)
from src.common import get_logger
from src.core.nodes import BaseNode

logger = get_logger(__name__)


class AngleProposalNode(BaseNode[AgentState, AngleProposalList]):
    """切り口提案ノード.

    キーワードとカテゴリに基づいて、3つの異なる記事切り口を提案する。
    """

    def __init__(self):
        super().__init__(
            prompt_config=ANGLE_PROPOSAL_PROMPT_CONFIG,
            output_schema=AngleProposalList,
        )

    def extract_prompt_variables(self, state: AgentState) -> dict[str, Any]:
        input_data = state["input"]
        return {
            "keywords": ", ".join(input_data.keywords),
            "category": input_data.topic,
            "context": f"トーン: {input_data.tone}, 目標文字数: {input_data.target_length}文字",
        }

    def update_state(
        self, state: AgentState, output: AngleProposalList
    ) -> dict[str, Any]:
        logger.info(f"切り口提案完了: {len(output.proposals)}件の提案")
        return {"angle_proposals": output}

    def __call__(self, state: AgentState) -> dict[str, Any]:
        logger.info("切り口提案を開始")
        return super().__call__(state)


class AngleSelectionNode(BaseNode[AgentState, AngleSelection]):
    """切り口選択ノード.

    提案された切り口から最適なものを選択する。
    自動選択モード（LLMが選択）と手動選択モード（インデックス指定）をサポート。
    """

    def __init__(self, auto_select: bool = True, selected_index: int | None = None):
        """AngleSelectionNodeを初期化.

        Args:
            auto_select: 自動選択モードを使用するかどうか
            selected_index: 手動選択時のインデックス（0始まり）
        """
        super().__init__(
            prompt_config=ANGLE_SELECTION_PROMPT_CONFIG,
            output_schema=AngleSelection,
        )
        self._auto_select = auto_select
        self._selected_index = selected_index

    def should_skip(self, state: AgentState) -> bool:
        return state.get("angle_proposals") is None

    def extract_prompt_variables(self, state: AgentState) -> dict[str, Any]:
        input_data = state["input"]
        proposals = state["angle_proposals"]

        proposals_text = "\n\n".join(
            f"### {i}. {p.title}\n- 概要: {p.summary}\n- 想定読者: {p.target_audience}\n- 差別化: {p.differentiator}"
            for i, p in enumerate(proposals.proposals)
        )

        return {
            "topic": input_data.topic,
            "keywords": ", ".join(input_data.keywords),
            "proposals": proposals_text,
        }

    def update_state(
        self, state: AgentState, output: AngleSelection
    ) -> dict[str, Any]:
        proposals = state["angle_proposals"]
        # 境界チェック: LLMが範囲外のインデックスを返した場合に対応
        selected_index = min(max(0, output.selected_index), len(proposals.proposals) - 1)
        selected = proposals.proposals[selected_index]
        logger.info(f"切り口選択完了: {selected.title}")
        # 自動選択時はauto_selected=Trueを明示的に設定
        result = AngleSelection(
            selected_index=selected_index,
            reason=output.reason,
            auto_selected=True if self._auto_select else output.auto_selected,
        )
        return {"selected_angle": result}

    def __call__(self, state: AgentState) -> dict[str, Any]:
        if self.should_skip(state):
            logger.warning("切り口提案がありません")
            return {}

        logger.info("切り口選択を開始")

        if self._auto_select:
            # LLMによる自動選択
            return super().__call__(state)
        else:
            # 手動選択モード
            proposals = state["angle_proposals"]
            index = self._selected_index if self._selected_index is not None else 0

            if index < 0 or index >= len(proposals.proposals):
                logger.warning(f"無効なインデックス: {index}")
                index = 0

            selection = AngleSelection(
                selected_index=index,
                reason="ユーザーによる手動選択",
                auto_selected=False,
            )
            return self.update_state(state, selection)


class PlannerNode(BaseNode[AgentState, ArticlePlan]):
    """記事構成計画ノード"""

    def __init__(self):
        super().__init__(
            prompt_config=PLANNER_PROMPT_CONFIG,
            output_schema=ArticlePlan,
        )

    def extract_prompt_variables(self, state: AgentState) -> dict[str, Any]:
        input_data = state["input"]
        return {
            "topic": input_data.topic,
            "keywords": ", ".join(input_data.keywords),
            "target_length": input_data.target_length,
            "tone": input_data.tone,
        }

    def update_state(self, state: AgentState, output: ArticlePlan) -> dict[str, Any]:
        logger.info(f"記事構成計画完了: {len(output.sections)}個のセクション")
        return {"plan": output}

    def __call__(self, state: AgentState) -> dict[str, Any]:
        logger.info("記事構成計画を開始")
        return super().__call__(state)


class ExecutorNode(BaseNode[AgentState, Section]):
    """セクション執筆ノード

    計画された各セクションを順次執筆する。
    BaseNodeを継承し、セクションごとにLLMを呼び出す。
    """

    def __init__(self):
        super().__init__(
            prompt_config=EXECUTOR_PROMPT_CONFIG,
            output_schema=Section,
        )

    def should_skip(self, state: AgentState) -> bool:
        return state.get("plan") is None

    def extract_prompt_variables(self, state: AgentState) -> dict[str, Any]:
        # この実装では使用しない（__call__でオーバーライド）
        return {}

    def update_state(self, state: AgentState, output: Section) -> dict[str, Any]:
        # この実装では使用しない（__call__でオーバーライド）
        return {}

    def __call__(self, state: AgentState) -> dict[str, Any]:
        if self.should_skip(state):
            logger.warning("計画が設定されていません")
            return {}

        logger.info("セクション執筆を開始")

        plan = state["plan"]
        input_data = state["input"]
        existing_sections = list(state.get("sections", []))

        # 未執筆のセクションを特定
        written_headings = {s.heading for s in existing_sections}
        sections_to_write = [
            s for s in plan.sections if s.heading not in written_headings
        ]

        if not sections_to_write:
            logger.info("すべてのセクションが執筆済み")
            return {"sections": existing_sections}

        model_factory = self._get_model_factory()
        model = model_factory(Section)

        new_sections = []
        for planned in sections_to_write:
            logger.info(f"セクション執筆: {planned.heading}")

            variables = {
                "topic": input_data.topic,
                "heading": planned.heading,
                "level": planned.level,
                "description": planned.description,
                "keywords": ", ".join(input_data.keywords),
                "tone": input_data.tone,
            }

            messages = [
                SystemMessage(content=self.prompt_config.system_prompt),
                HumanMessage(
                    content=self.prompt_config.user_prompt_template.format(**variables)
                ),
            ]

            section = model.invoke(messages)
            # 見出しとレベルを計画から設定
            section.heading = planned.heading
            section.level = planned.level
            new_sections.append(section)

        all_sections = existing_sections + new_sections
        logger.info(f"セクション執筆完了: {len(new_sections)}個のセクションを執筆")

        return {"sections": all_sections}


class ReflectorNode(BaseNode[AgentState, ReflectionResult]):
    """品質チェックノード"""

    def __init__(self):
        super().__init__(
            prompt_config=REFLECTOR_PROMPT_CONFIG,
            output_schema=ReflectionResult,
        )

    def should_skip(self, state: AgentState) -> bool:
        return state.get("plan") is None

    def extract_prompt_variables(self, state: AgentState) -> dict[str, Any]:
        input_data = state["input"]
        plan = state["plan"]
        sections = state.get("sections", [])

        planned_sections = "\n".join(
            f"- {s.heading}（H{s.level}）: {s.description}" for s in plan.sections
        )

        written_sections = "\n".join(
            f"## {s.heading}\n{s.content[:200]}..." for s in sections
        )

        return {
            "topic": input_data.topic,
            "keywords": ", ".join(input_data.keywords),
            "planned_sections": planned_sections,
            "written_sections": written_sections or "なし",
        }

    def update_state(
        self, state: AgentState, output: ReflectionResult
    ) -> dict[str, Any]:
        logger.info(f"品質チェック完了: 十分={output.is_sufficient}")
        return {
            "reflection": output,
            "retry_count": state.get("retry_count", 0) + 1,
        }

    def __call__(self, state: AgentState) -> dict[str, Any]:
        if self.should_skip(state):
            logger.warning("計画が設定されていません")
            return {}
        logger.info("品質チェックを開始")
        return super().__call__(state)


class IntegratorNode(BaseNode[AgentState, WriterOutput]):
    """結果統合ノード"""

    def __init__(self):
        super().__init__(
            prompt_config=INTEGRATOR_PROMPT_CONFIG,
            output_schema=WriterOutput,
        )

    def should_skip(self, state: AgentState) -> bool:
        return state.get("plan") is None

    def extract_prompt_variables(self, state: AgentState) -> dict[str, Any]:
        input_data = state["input"]
        plan = state["plan"]
        sections = state.get("sections", [])

        sections_text = "\n\n".join(f"## {s.heading}\n{s.content}" for s in sections)

        return {
            "title": plan.title,
            "topic": input_data.topic,
            "keywords": ", ".join(input_data.keywords),
            "sections": sections_text or "なし",
        }

    def update_state(self, state: AgentState, output: WriterOutput) -> dict[str, Any]:
        logger.info(f"結果統合完了: {output.title}")
        return {"output": output}

    def __call__(self, state: AgentState) -> dict[str, Any]:
        if self.should_skip(state):
            logger.warning("計画が設定されていません")
            return {}
        logger.info("結果統合を開始")
        return super().__call__(state)
