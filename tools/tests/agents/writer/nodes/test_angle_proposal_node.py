"""AngleProposalNodeのテスト."""

from unittest.mock import MagicMock, patch

import pytest

from src.agents.writer.nodes import AngleProposalNode
from src.agents.writer.schemas import (
    AgentState,
    AngleProposal,
    AngleProposalList,
    WriterInput,
)
from src.core.nodes import BaseNode


class TestAngleProposalNode:
    """AngleProposalNodeのテスト."""

    def test_inherits_base_node(self):
        """BaseNodeを継承している."""
        node = AngleProposalNode()
        assert isinstance(node, BaseNode)

    def test_has_correct_output_schema(self):
        """出力スキーマがAngleProposalListである."""
        node = AngleProposalNode()
        assert node.output_schema == AngleProposalList

    def test_extract_prompt_variables(self):
        """stateから正しくプロンプト変数を抽出する."""
        node = AngleProposalNode()
        state: AgentState = {
            "input": WriterInput(
                topic="NISAで資産形成",
                keywords=["NISA", "投資信託", "積立"],
            ),
            "messages": [],
            "angle_proposals": None,
            "selected_angle": None,
            "plan": None,
            "sections": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        variables = node.extract_prompt_variables(state)

        assert "keywords" in variables
        assert "NISA" in variables["keywords"]
        assert "category" in variables or "topic" in variables

    def test_update_state_sets_angle_proposals(self):
        """出力をstateに正しく設定する."""
        node = AngleProposalNode()
        state: AgentState = {
            "input": WriterInput(
                topic="NISAで資産形成",
                keywords=["NISA"],
            ),
            "messages": [],
            "angle_proposals": None,
            "selected_angle": None,
            "plan": None,
            "sections": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        output = AngleProposalList(
            proposals=[
                AngleProposal(
                    title="初心者向けNISA完全ガイド",
                    summary="投資未経験者向けの入門記事",
                    target_audience="20-30代会社員",
                    differentiator="専門用語を使わない",
                ),
            ],
            reasoning="初心者向けの切り口が有効",
        )

        updates = node.update_state(state, output)

        assert "angle_proposals" in updates
        assert updates["angle_proposals"] == output

    @patch("src.models.get_structured_model")
    def test_call_invokes_llm(self, mock_get_model):
        """__call__でLLMが呼び出される."""
        mock_model = MagicMock()
        mock_model.invoke.return_value = AngleProposalList(
            proposals=[
                AngleProposal(
                    title="テスト記事",
                    summary="テスト概要",
                    target_audience="テスト読者",
                    differentiator="テスト差別化",
                ),
            ],
            reasoning="テスト理由",
        )
        mock_get_model.return_value = mock_model

        node = AngleProposalNode()
        state: AgentState = {
            "input": WriterInput(
                topic="テストトピック",
                keywords=["キーワード1"],
            ),
            "messages": [],
            "plan": None,
            "sections": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
            "angle_proposals": None,
            "selected_angle": None,
        }

        result = node(state)

        mock_model.invoke.assert_called_once()
        assert "angle_proposals" in result
