"""Tests for image suggestion prompt config."""


class TestImageSuggestionPromptConfig:
    """IMAGE_SUGGESTION_PROMPT_CONFIG tests."""

    def test_prompt_config_exists(self):
        from src.agents.writer.prompts.image_suggestion import (
            IMAGE_SUGGESTION_PROMPT_CONFIG,
        )

        assert IMAGE_SUGGESTION_PROMPT_CONFIG is not None

    def test_has_system_prompt(self):
        from src.agents.writer.prompts.image_suggestion import (
            IMAGE_SUGGESTION_PROMPT_CONFIG,
        )

        assert IMAGE_SUGGESTION_PROMPT_CONFIG.system_prompt
        assert len(IMAGE_SUGGESTION_PROMPT_CONFIG.system_prompt) > 0

    def test_has_user_prompt_template(self):
        from src.agents.writer.prompts.image_suggestion import (
            IMAGE_SUGGESTION_PROMPT_CONFIG,
        )

        assert IMAGE_SUGGESTION_PROMPT_CONFIG.user_prompt_template
        assert "{title}" in IMAGE_SUGGESTION_PROMPT_CONFIG.user_prompt_template
        assert "{keywords}" in IMAGE_SUGGESTION_PROMPT_CONFIG.user_prompt_template

    def test_exported_from_init(self):
        from src.agents.writer.prompts import IMAGE_SUGGESTION_PROMPT_CONFIG

        assert IMAGE_SUGGESTION_PROMPT_CONFIG is not None
