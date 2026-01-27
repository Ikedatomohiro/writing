"""AngleProposal関連スキーマのテスト."""

import pytest
from pydantic import ValidationError

from src.agents.writer.schemas.angle import (
    AngleProposal,
    AngleProposalList,
    AngleSelection,
)


class TestAngleProposal:
    """AngleProposalスキーマのテスト."""

    def test_valid_angle_proposal(self):
        """正常なAngleProposalが作成できる."""
        proposal = AngleProposal(
            title="初心者向けNISA入門ガイド",
            summary="投資未経験者向けに、NISAの基本から口座開設までを解説",
            target_audience="投資を始めたい20-30代会社員",
            differentiator="専門用語を使わず、図解で分かりやすく説明",
        )
        assert proposal.title == "初心者向けNISA入門ガイド"
        assert "投資未経験者" in proposal.summary
        assert "20-30代" in proposal.target_audience
        assert "図解" in proposal.differentiator

    def test_angle_proposal_requires_title(self):
        """titleは必須."""
        with pytest.raises(ValidationError):
            AngleProposal(
                title="",  # 空文字は不可
                summary="概要",
                target_audience="読者",
                differentiator="差別化",
            )

    def test_angle_proposal_requires_all_fields(self):
        """全フィールドが必須."""
        with pytest.raises(ValidationError):
            AngleProposal(title="タイトル")  # 他のフィールドが欠けている


class TestAngleProposalList:
    """AngleProposalListスキーマのテスト."""

    def test_valid_angle_proposal_list(self):
        """正常なAngleProposalListが作成できる."""
        proposals = AngleProposalList(
            proposals=[
                AngleProposal(
                    title="切り口A",
                    summary="概要A",
                    target_audience="読者A",
                    differentiator="差別化A",
                ),
                AngleProposal(
                    title="切り口B",
                    summary="概要B",
                    target_audience="読者B",
                    differentiator="差別化B",
                ),
                AngleProposal(
                    title="切り口C",
                    summary="概要C",
                    target_audience="読者C",
                    differentiator="差別化C",
                ),
            ],
            reasoning="3つの異なるアプローチを提案",
        )
        assert len(proposals.proposals) == 3
        assert proposals.reasoning == "3つの異なるアプローチを提案"

    def test_angle_proposal_list_requires_at_least_one(self):
        """最低1件の提案が必要."""
        with pytest.raises(ValidationError):
            AngleProposalList(proposals=[], reasoning="理由")

    def test_angle_proposal_list_max_proposals(self):
        """提案は最大5件まで."""
        proposals = [
            AngleProposal(
                title=f"切り口{i}",
                summary=f"概要{i}",
                target_audience=f"読者{i}",
                differentiator=f"差別化{i}",
            )
            for i in range(6)
        ]
        with pytest.raises(ValidationError):
            AngleProposalList(proposals=proposals, reasoning="理由")


class TestAngleSelection:
    """AngleSelectionスキーマのテスト."""

    def test_valid_angle_selection(self):
        """正常なAngleSelectionが作成できる."""
        selection = AngleSelection(
            selected_index=0,
            reason="最も読者のニーズに合致している",
        )
        assert selection.selected_index == 0
        assert "ニーズ" in selection.reason

    def test_angle_selection_index_must_be_non_negative(self):
        """インデックスは0以上."""
        with pytest.raises(ValidationError):
            AngleSelection(selected_index=-1, reason="理由")

    def test_angle_selection_with_auto_select(self):
        """自動選択フラグ付きの選択."""
        selection = AngleSelection(
            selected_index=1,
            reason="バランスの良い切り口",
            auto_selected=True,
        )
        assert selection.auto_selected is True
