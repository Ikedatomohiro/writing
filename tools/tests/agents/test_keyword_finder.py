"""キーワード検索エージェントのテスト"""

import pytest

from src.agents.keyword_finder.schemas import (
    KeywordResult,
    KeywordSearchInput,
    KeywordSearchOutput,
)


class TestKeywordSearchInput:
    """KeywordSearchInputのテスト"""

    def test_valid_input(self):
        """有効な入力でインスタンスを作成できる"""
        input_data = KeywordSearchInput(
            category="資産形成",
            seed_keywords=["iDeCo", "積立NISA"],
            depth=2,
        )
        assert input_data.category == "資産形成"
        assert input_data.seed_keywords == ["iDeCo", "積立NISA"]
        assert input_data.depth == 2

    def test_default_depth(self):
        """depthのデフォルト値が2である"""
        input_data = KeywordSearchInput(
            category="健康",
            seed_keywords=["睡眠"],
        )
        assert input_data.depth == 2

    def test_invalid_category(self):
        """無効なカテゴリでエラーが発生する"""
        with pytest.raises(ValueError):
            KeywordSearchInput(
                category="無効なカテゴリ",
                seed_keywords=["test"],
            )

    def test_empty_seed_keywords(self):
        """空のシードキーワードでエラーが発生する"""
        with pytest.raises(ValueError):
            KeywordSearchInput(
                category="資産形成",
                seed_keywords=[],
            )

    def test_depth_range(self):
        """depthは1-3の範囲でなければならない"""
        with pytest.raises(ValueError):
            KeywordSearchInput(
                category="資産形成",
                seed_keywords=["test"],
                depth=0,
            )
        with pytest.raises(ValueError):
            KeywordSearchInput(
                category="資産形成",
                seed_keywords=["test"],
                depth=4,
            )


class TestKeywordResult:
    """KeywordResultのテスト"""

    def test_valid_result(self):
        """有効な結果でインスタンスを作成できる"""
        result = KeywordResult(
            keyword="iDeCo 始め方",
            competition="低",
            relevance_score=0.85,
            suggested_topics=["iDeCoの始め方ガイド"],
        )
        assert result.keyword == "iDeCo 始め方"
        assert result.competition == "低"
        assert result.relevance_score == 0.85

    def test_relevance_score_range(self):
        """relevance_scoreは0-1の範囲でなければならない"""
        with pytest.raises(ValueError):
            KeywordResult(
                keyword="test",
                relevance_score=1.5,
            )
        with pytest.raises(ValueError):
            KeywordResult(
                keyword="test",
                relevance_score=-0.1,
            )


class TestKeywordSearchOutput:
    """KeywordSearchOutputのテスト"""

    def test_valid_output(self):
        """有効な出力でインスタンスを作成できる"""
        output = KeywordSearchOutput(
            category="資産形成",
            seed_keywords=["iDeCo"],
            results=[
                KeywordResult(
                    keyword="iDeCo 始め方",
                    relevance_score=0.9,
                )
            ],
            summary="iDeCoに関するキーワードを発見しました。",
        )
        assert output.category == "資産形成"
        assert len(output.results) == 1
        assert output.results[0].keyword == "iDeCo 始め方"
