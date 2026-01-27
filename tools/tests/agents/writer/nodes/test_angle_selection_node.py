"""AngleSelectionNodeのテスト."""

from unittest.mock import MagicMock, patch

import pytest

from src.agents.writer.nodes import AngleSelectionNode
from src.agents.writer.schemas import (
    AgentState,
    AngleProposal,
    AngleProposalList,
    AngleSelection,
    WriterInput,
)
from src.core.nodes import BaseNode


class TestAngleSelectionNode:
    """AngleSelectionNodeのテスト."""

    def test_inherits_base_node(self):
        """BaseNodeを継承している."""
        node = AngleSelectionNode()
        assert isinstance(node, BaseNode)

    def test_has_correct_output_schema(self):
        """出力スキーマがAngleSelectionである."""
        node = AngleSelectionNode()
        assert node.output_schema == AngleSelection

    def test_auto_select_default_true(self):
        """デフォルトで自動選択モードが有効."""
        node = AngleSelectionNode()
        assert node._auto_select is True

    def test_manual_select_mode(self):
        """手動選択モードを設定できる."""
        node = AngleSelectionNode(auto_select=False, selected_index=1)
        assert node._auto_select is False
        assert node._selected_index == 1

    def test_should_skip_when_no_proposals(self):
        """angle_proposalsがない場合はスキップする."""
        node = AngleSelectionNode()
        state: AgentState = {
            "input": WriterInput(topic="テスト", keywords=["キーワード"]),
            "messages": [],
            "angle_proposals": None,
            "selected_angle": None,
            "plan": None,
            "sections": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        assert node.should_skip(state) is True

    def test_should_not_skip_when_proposals_exist(self):
        """angle_proposalsがある場合はスキップしない."""
        node = AngleSelectionNode()
        state: AgentState = {
            "input": WriterInput(topic="テスト", keywords=["キーワード"]),
            "messages": [],
            "angle_proposals": AngleProposalList(
                proposals=[
                    AngleProposal(
                        title="テスト切り口",
                        summary="テスト概要",
                        target_audience="テスト対象",
                        differentiator="テスト差別化",
                    )
                ],
                reasoning="テスト理由",
            ),
            "selected_angle": None,
            "plan": None,
            "sections": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        assert node.should_skip(state) is False

    def test_extract_prompt_variables(self):
        """stateから正しくプロンプト変数を抽出する."""
        node = AngleSelectionNode()
        proposals = [
            AngleProposal(
                title="初心者向けガイド",
                summary="入門者向けの解説",
                target_audience="初心者",
                differentiator="わかりやすさ",
            ),
            AngleProposal(
                title="実践的コード例",
                summary="手を動かして学ぶ",
                target_audience="中級者",
                differentiator="実用性",
            ),
        ]
        state: AgentState = {
            "input": WriterInput(
                topic="Pythonの基礎",
                keywords=["Python", "入門", "プログラミング"],
            ),
            "messages": [],
            "angle_proposals": AngleProposalList(
                proposals=proposals,
                reasoning="検索意図を分析した結果",
            ),
            "selected_angle": None,
            "plan": None,
            "sections": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        variables = node.extract_prompt_variables(state)

        assert "topic" in variables
        assert variables["topic"] == "Pythonの基礎"
        assert "keywords" in variables
        assert "Python" in variables["keywords"]
        assert "proposals" in variables
        assert "初心者向けガイド" in variables["proposals"]
        assert "実践的コード例" in variables["proposals"]

    def test_update_state_sets_selected_angle(self):
        """出力をstateに正しく設定する."""
        node = AngleSelectionNode()
        proposals = [
            AngleProposal(
                title="テスト切り口1",
                summary="概要1",
                target_audience="対象1",
                differentiator="差別化1",
            ),
            AngleProposal(
                title="テスト切り口2",
                summary="概要2",
                target_audience="対象2",
                differentiator="差別化2",
            ),
        ]
        state: AgentState = {
            "input": WriterInput(topic="テスト", keywords=["キーワード"]),
            "messages": [],
            "angle_proposals": AngleProposalList(
                proposals=proposals,
                reasoning="理由",
            ),
            "selected_angle": None,
            "plan": None,
            "sections": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        output = AngleSelection(
            selected_index=1,
            reason="2番目が最適",
            auto_selected=True,
        )

        updates = node.update_state(state, output)

        assert "selected_angle" in updates
        assert updates["selected_angle"] == output

    def test_call_returns_empty_when_no_proposals(self):
        """angle_proposalsがない場合は空を返す."""
        node = AngleSelectionNode()
        state: AgentState = {
            "input": WriterInput(topic="テスト", keywords=["キーワード"]),
            "messages": [],
            "angle_proposals": None,
            "selected_angle": None,
            "plan": None,
            "sections": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        result = node(state)

        assert result == {}

    def test_manual_selection_returns_selected_index(self):
        """手動選択モードで指定されたインデックスを返す."""
        node = AngleSelectionNode(auto_select=False, selected_index=1)
        proposals = [
            AngleProposal(
                title="切り口1",
                summary="概要1",
                target_audience="対象1",
                differentiator="差別化1",
            ),
            AngleProposal(
                title="切り口2",
                summary="概要2",
                target_audience="対象2",
                differentiator="差別化2",
            ),
            AngleProposal(
                title="切り口3",
                summary="概要3",
                target_audience="対象3",
                differentiator="差別化3",
            ),
        ]
        state: AgentState = {
            "input": WriterInput(topic="テスト", keywords=["キーワード"]),
            "messages": [],
            "angle_proposals": AngleProposalList(
                proposals=proposals,
                reasoning="理由",
            ),
            "selected_angle": None,
            "plan": None,
            "sections": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        result = node(state)

        assert "selected_angle" in result
        assert result["selected_angle"].selected_index == 1
        assert result["selected_angle"].auto_selected is False

    def test_manual_selection_with_invalid_index_defaults_to_zero(self):
        """無効なインデックスは0にフォールバックする."""
        node = AngleSelectionNode(auto_select=False, selected_index=99)
        proposals = [
            AngleProposal(
                title="切り口1",
                summary="概要1",
                target_audience="対象1",
                differentiator="差別化1",
            ),
        ]
        state: AgentState = {
            "input": WriterInput(topic="テスト", keywords=["キーワード"]),
            "messages": [],
            "angle_proposals": AngleProposalList(
                proposals=proposals,
                reasoning="理由",
            ),
            "selected_angle": None,
            "plan": None,
            "sections": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        result = node(state)

        assert result["selected_angle"].selected_index == 0

    @patch("src.models.get_structured_model")
    def test_auto_selection_invokes_llm(self, mock_get_model):
        """自動選択モードでLLMが呼び出される."""
        mock_model = MagicMock()
        mock_model.invoke.return_value = AngleSelection(
            selected_index=0,
            reason="最適な選択",
            auto_selected=True,
        )
        mock_get_model.return_value = mock_model

        node = AngleSelectionNode(auto_select=True)
        proposals = [
            AngleProposal(
                title="テスト切り口",
                summary="テスト概要",
                target_audience="テスト対象",
                differentiator="テスト差別化",
            ),
        ]
        state: AgentState = {
            "input": WriterInput(topic="テスト", keywords=["キーワード"]),
            "messages": [],
            "angle_proposals": AngleProposalList(
                proposals=proposals,
                reasoning="テスト理由",
            ),
            "selected_angle": None,
            "plan": None,
            "sections": [],
            "reflection": None,
            "retry_count": 0,
            "output": None,
        }

        result = node(state)

        mock_model.invoke.assert_called_once()
        assert "selected_angle" in result
        assert result["selected_angle"].selected_index == 0
