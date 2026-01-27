"""angle_proposalプロンプト設定のテスト."""

import pytest

from src.agents.writer.prompts.angle_proposal import ANGLE_PROPOSAL_PROMPT_CONFIG
from src.core.nodes import PromptConfig


class TestAngleProposalPromptConfig:
    """ANGLE_PROPOSAL_PROMPT_CONFIGのテスト."""

    def test_is_prompt_config(self):
        """PromptConfig型である."""
        assert isinstance(ANGLE_PROPOSAL_PROMPT_CONFIG, PromptConfig)

    def test_has_system_prompt(self):
        """システムプロンプトが設定されている."""
        assert ANGLE_PROPOSAL_PROMPT_CONFIG.system_prompt
        assert len(ANGLE_PROPOSAL_PROMPT_CONFIG.system_prompt) > 100

    def test_has_user_prompt_template(self):
        """ユーザープロンプトテンプレートが設定されている."""
        assert ANGLE_PROPOSAL_PROMPT_CONFIG.user_prompt_template
        assert len(ANGLE_PROPOSAL_PROMPT_CONFIG.user_prompt_template) > 50

    def test_user_prompt_has_required_placeholders(self):
        """必須プレースホルダーが含まれている."""
        template = ANGLE_PROPOSAL_PROMPT_CONFIG.user_prompt_template
        assert "{keyword}" in template or "{keywords}" in template
        assert "{category}" in template

    def test_system_prompt_mentions_angle(self):
        """システムプロンプトに切り口に関する記述がある."""
        system_prompt = ANGLE_PROPOSAL_PROMPT_CONFIG.system_prompt
        assert "切り口" in system_prompt or "アングル" in system_prompt or "angle" in system_prompt.lower()

    def test_system_prompt_mentions_differentiation(self):
        """システムプロンプトに差別化に関する記述がある."""
        system_prompt = ANGLE_PROPOSAL_PROMPT_CONFIG.system_prompt
        assert "差別化" in system_prompt or "他記事" in system_prompt or "独自" in system_prompt
