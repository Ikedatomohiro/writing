"""Tests for image integration with WriterOutput and AgentState."""

from src.agents.writer.schemas.output import WriterOutput


class TestWriterOutputImageSuggestions:
    """WriterOutput image_suggestions field tests."""

    def test_default_none(self):
        output = WriterOutput(
            title="テスト記事",
            description="テスト概要",
            content="テスト本文",
            keywords_used=["テスト"],
            sections=[],
            summary="テストサマリー",
        )
        assert output.image_suggestions is None

    def test_with_image_suggestions(self):
        from src.agents.writer.schemas.image import (
            ImageSuggestion,
            ImageSuggestions,
        )

        eyecatch = ImageSuggestion(
            purpose="eyecatch",
            search_query="sunset landscape",
            photos=[],
            alt_text="美しい夕焼け",
        )
        suggestions = ImageSuggestions(
            eyecatch=eyecatch,
            inline_images=[],
        )
        output = WriterOutput(
            title="テスト記事",
            description="テスト概要",
            content="テスト本文",
            keywords_used=["テスト"],
            sections=[],
            summary="テストサマリー",
            image_suggestions=suggestions,
        )
        assert output.image_suggestions is not None
        assert output.image_suggestions.eyecatch.purpose == "eyecatch"


class TestAgentStateImageSuggestions:
    """AgentState image_suggestions field tests."""

    def test_state_has_image_suggestions_field(self):
        from src.agents.writer.schemas.state import AgentState

        # AgentState is a TypedDict, verify field exists in annotations
        assert "image_suggestions" in AgentState.__annotations__
