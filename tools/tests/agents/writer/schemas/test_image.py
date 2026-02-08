"""Tests for image suggestion schemas."""

import pytest
from pydantic import ValidationError


class TestUnsplashPhoto:
    """UnsplashPhoto schema tests."""

    def test_valid_photo(self):
        from src.agents.writer.schemas.image import UnsplashPhoto

        photo = UnsplashPhoto(
            photo_id="abc123",
            url="https://images.unsplash.com/photo-abc123",
            thumbnail_url="https://images.unsplash.com/photo-abc123?w=200",
            photographer="John Doe",
            photographer_url="https://unsplash.com/@johndoe",
            description="A beautiful sunset",
        )
        assert photo.photo_id == "abc123"
        assert photo.photographer == "John Doe"

    def test_optional_description(self):
        from src.agents.writer.schemas.image import UnsplashPhoto

        photo = UnsplashPhoto(
            photo_id="abc123",
            url="https://images.unsplash.com/photo-abc123",
            thumbnail_url="https://images.unsplash.com/photo-abc123?w=200",
            photographer="John Doe",
            photographer_url="https://unsplash.com/@johndoe",
        )
        assert photo.description is None


class TestImageSuggestion:
    """ImageSuggestion schema tests."""

    def test_valid_suggestion(self):
        from src.agents.writer.schemas.image import (
            ImageSuggestion,
            UnsplashPhoto,
        )

        photo = UnsplashPhoto(
            photo_id="abc123",
            url="https://images.unsplash.com/photo-abc123",
            thumbnail_url="https://images.unsplash.com/photo-abc123?w=200",
            photographer="John Doe",
            photographer_url="https://unsplash.com/@johndoe",
        )
        suggestion = ImageSuggestion(
            purpose="eyecatch",
            search_query="sunset landscape",
            photos=[photo],
            selected_photo=photo,
            alt_text="美しい夕焼け",
        )
        assert suggestion.purpose == "eyecatch"
        assert len(suggestion.photos) == 1
        assert suggestion.selected_photo is not None

    def test_valid_purposes(self):
        from src.agents.writer.schemas.image import ImageSuggestion

        for purpose in ["eyecatch", "inline", "ogp"]:
            suggestion = ImageSuggestion(
                purpose=purpose,
                search_query="test",
                photos=[],
                alt_text="test",
            )
            assert suggestion.purpose == purpose

    def test_invalid_purpose(self):
        from src.agents.writer.schemas.image import ImageSuggestion

        with pytest.raises(ValidationError):
            ImageSuggestion(
                purpose="invalid_type",
                search_query="test",
                photos=[],
                alt_text="test",
            )

    def test_no_photos_selected_photo_none(self):
        from src.agents.writer.schemas.image import ImageSuggestion

        suggestion = ImageSuggestion(
            purpose="eyecatch",
            search_query="test",
            photos=[],
            alt_text="test",
        )
        assert suggestion.selected_photo is None

    def test_section_heading_for_inline(self):
        from src.agents.writer.schemas.image import ImageSuggestion

        suggestion = ImageSuggestion(
            purpose="inline",
            search_query="coding workspace",
            photos=[],
            alt_text="コーディング環境",
            section_heading="開発環境の構築",
        )
        assert suggestion.section_heading == "開発環境の構築"


class TestImageSuggestions:
    """ImageSuggestions schema tests."""

    def test_valid_suggestions(self):
        from src.agents.writer.schemas.image import (
            ImageSuggestion,
            ImageSuggestions,
        )

        eyecatch = ImageSuggestion(
            purpose="eyecatch",
            search_query="sunset",
            photos=[],
            alt_text="夕焼け",
        )
        suggestions = ImageSuggestions(
            eyecatch=eyecatch,
            inline_images=[],
            ogp=eyecatch,
        )
        assert suggestions.eyecatch.purpose == "eyecatch"
        assert len(suggestions.inline_images) == 0

    def test_optional_ogp(self):
        from src.agents.writer.schemas.image import (
            ImageSuggestion,
            ImageSuggestions,
        )

        eyecatch = ImageSuggestion(
            purpose="eyecatch",
            search_query="sunset",
            photos=[],
            alt_text="夕焼け",
        )
        suggestions = ImageSuggestions(
            eyecatch=eyecatch,
            inline_images=[],
        )
        assert suggestions.ogp is None

    def test_multiple_inline_images(self):
        from src.agents.writer.schemas.image import (
            ImageSuggestion,
            ImageSuggestions,
        )

        eyecatch = ImageSuggestion(
            purpose="eyecatch",
            search_query="sunset",
            photos=[],
            alt_text="夕焼け",
        )
        inline1 = ImageSuggestion(
            purpose="inline",
            search_query="coding",
            photos=[],
            alt_text="コーディング",
            section_heading="セクション1",
        )
        inline2 = ImageSuggestion(
            purpose="inline",
            search_query="teamwork",
            photos=[],
            alt_text="チームワーク",
            section_heading="セクション2",
        )
        suggestions = ImageSuggestions(
            eyecatch=eyecatch,
            inline_images=[inline1, inline2],
        )
        assert len(suggestions.inline_images) == 2


class TestImageSearchQuery:
    """ImageSearchQuery schema tests."""

    def test_valid_query(self):
        from src.agents.writer.schemas.image import ImageSearchQuery

        query = ImageSearchQuery(
            eyecatch_query="sunset landscape nature",
            inline_queries=[
                {"heading": "セクション1", "query": "coding workspace"},
            ],
            ogp_query="sunset",
        )
        assert query.eyecatch_query == "sunset landscape nature"
        assert len(query.inline_queries) == 1

    def test_empty_inline_queries(self):
        from src.agents.writer.schemas.image import ImageSearchQuery

        query = ImageSearchQuery(
            eyecatch_query="test",
            inline_queries=[],
        )
        assert len(query.inline_queries) == 0
        assert query.ogp_query is None
