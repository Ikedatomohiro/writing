"""切り口選択プロンプトのテスト."""

import pytest

from src.agents.writer.prompts import ANGLE_SELECTION_PROMPT_CONFIG
from src.core.nodes import PromptConfig


class TestAngleSelectionPromptConfig:
    """ANGLE_SELECTION_PROMPT_CONFIGのテスト."""

    def test_is_prompt_config(self):
        """PromptConfigインスタンスである."""
        assert isinstance(ANGLE_SELECTION_PROMPT_CONFIG, PromptConfig)

    def test_has_system_prompt(self):
        """システムプロンプトが設定されている."""
        assert ANGLE_SELECTION_PROMPT_CONFIG.system_prompt is not None
        assert len(ANGLE_SELECTION_PROMPT_CONFIG.system_prompt) > 0

    def test_has_user_prompt_template(self):
        """ユーザープロンプトテンプレートが設定されている."""
        assert ANGLE_SELECTION_PROMPT_CONFIG.user_prompt_template is not None
        assert len(ANGLE_SELECTION_PROMPT_CONFIG.user_prompt_template) > 0

    def test_user_prompt_contains_required_placeholders(self):
        """ユーザープロンプトに必要なプレースホルダーが含まれる."""
        template = ANGLE_SELECTION_PROMPT_CONFIG.user_prompt_template
        assert "{topic}" in template
        assert "{keywords}" in template
        assert "{proposals}" in template

    def test_system_prompt_mentions_selection(self):
        """システムプロンプトに選択に関する指示がある."""
        system_prompt = ANGLE_SELECTION_PROMPT_CONFIG.system_prompt.lower()
        assert "選択" in ANGLE_SELECTION_PROMPT_CONFIG.system_prompt
