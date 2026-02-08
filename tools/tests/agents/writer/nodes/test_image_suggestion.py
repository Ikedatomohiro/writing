"""Tests for ImageSuggestionNode."""

from unittest.mock import MagicMock, patch

import pytest

from src.agents.writer.schemas.image import (
    ImageSearchQuery,
    ImageSuggestion,
    ImageSuggestions,
)
from src.agents.writer.schemas.input import WriterInput
from src.agents.writer.schemas.output import Section, WriterOutput


def _make_state(output=None):
    """テスト用のAgentStateを作成する。"""
    if output is None:
        output = WriterOutput(
            title="新NISAの始め方ガイド",
            description="新NISAの基本を解説",
            content="# 新NISAの始め方\n\n投資初心者向けのガイドです。",
            keywords_used=["新NISA", "投資", "初心者"],
            sections=[
                Section(heading="新NISAとは", level=2, content="新NISAの概要"),
                Section(heading="始め方の手順", level=2, content="口座開設の方法"),
            ],
            summary="新NISA解説記事",
        )

    return {
        "input": WriterInput(
            topic="新NISAの始め方",
            keywords=["新NISA", "投資", "初心者"],
        ),
        "messages": [],
        "angle_proposals": None,
        "selected_angle": None,
        "research_result": None,
        "plan": None,
        "sections": [],
        "reflection": None,
        "retry_count": 0,
        "output": output,
        "persona": None,
        "image_suggestions": None,
    }


class TestImageSuggestionNode:
    """ImageSuggestionNode tests."""

    def test_skips_when_no_output(self):
        from src.agents.writer.nodes import ImageSuggestionNode

        node = ImageSuggestionNode()
        state = _make_state()
        state["output"] = None

        result = node(state)
        assert result == {}

    def test_returns_image_suggestions(self):
        from src.agents.writer.nodes import ImageSuggestionNode

        node = ImageSuggestionNode()
        state = _make_state()

        mock_query = ImageSearchQuery(
            eyecatch_query="investment guide beginner",
            inline_queries=[
                {"heading": "新NISAとは", "query": "nisa investment japan"},
            ],
            ogp_query=None,
        )

        mock_photo_dict = {
            "photo_id": "test1",
            "url": "https://images.unsplash.com/test1",
            "thumbnail_url": "https://images.unsplash.com/test1?w=200",
            "photographer": "Test User",
            "photographer_url": "https://unsplash.com/@testuser",
            "description": "test photo",
        }

        with (
            patch.object(
                node, "_generate_search_queries", return_value=mock_query
            ),
            patch(
                "src.agents.writer.nodes.search_unsplash_photos",
                return_value=[mock_photo_dict],
            ),
        ):
            result = node(state)

        assert "image_suggestions" in result
        suggestions = result["image_suggestions"]
        assert isinstance(suggestions, ImageSuggestions)
        assert suggestions.eyecatch.purpose == "eyecatch"
        assert suggestions.eyecatch.selected_photo is not None

    def test_handles_empty_search_results(self):
        from src.agents.writer.nodes import ImageSuggestionNode

        node = ImageSuggestionNode()
        state = _make_state()

        mock_query = ImageSearchQuery(
            eyecatch_query="investment guide",
            inline_queries=[],
        )

        with (
            patch.object(
                node, "_generate_search_queries", return_value=mock_query
            ),
            patch(
                "src.agents.writer.nodes.search_unsplash_photos",
                return_value=[],
            ),
        ):
            result = node(state)

        assert "image_suggestions" in result
        suggestions = result["image_suggestions"]
        assert suggestions.eyecatch.selected_photo is None
        assert len(suggestions.eyecatch.photos) == 0

    def test_updates_output_with_suggestions(self):
        from src.agents.writer.nodes import ImageSuggestionNode

        node = ImageSuggestionNode()
        state = _make_state()

        mock_query = ImageSearchQuery(
            eyecatch_query="investment",
            inline_queries=[],
        )

        with (
            patch.object(
                node, "_generate_search_queries", return_value=mock_query
            ),
            patch(
                "src.agents.writer.nodes.search_unsplash_photos",
                return_value=[],
            ),
        ):
            result = node(state)

        assert "output" in result
        assert result["output"].image_suggestions is not None
