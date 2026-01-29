"""ResearchNode tests."""

from unittest.mock import MagicMock, patch

import pytest

from src.agents.writer.nodes import ResearchNode
from src.agents.writer.schemas import WriterInput
from src.agents.writer.schemas.angle import AngleProposalList, AngleSelection, AngleProposal
from src.agents.writer.schemas.research import (
    ResearchFinding,
    ResearchResult,
    SearchQueries,
    SourceReference,
)
from src.tools.web_search import SearchResult


def _create_base_state(
    selected_angle: AngleSelection | None = None,
    angle_proposals: AngleProposalList | None = None,
) -> dict:
    """テスト用の基本stateを生成"""
    if angle_proposals is None:
        angle_proposals = AngleProposalList(
            proposals=[
                AngleProposal(
                    title="Python入門ガイド",
                    summary="初心者向けのPython解説",
                    target_audience="プログラミング初心者",
                    differentiator="実践的なサンプルコード付き",
                ),
            ],
            reasoning="初心者向けが最も需要がある",
        )
    if selected_angle is None:
        selected_angle = AngleSelection(
            selected_index=0,
            reason="初心者向けが最も需要がある",
            auto_selected=True,
        )
    return {
        "input": WriterInput(
            topic="Pythonプログラミング入門",
            keywords=["Python", "プログラミング", "入門"],
        ),
        "messages": [],
        "angle_proposals": angle_proposals,
        "selected_angle": selected_angle,
        "plan": None,
        "sections": [],
        "reflection": None,
        "retry_count": 0,
        "output": None,
        "research_result": None,
    }


class TestResearchNodeQueryGeneration:
    """ResearchNode の検索クエリ生成テスト"""

    def test_generates_search_queries_from_topic_and_angle(self):
        """トピックと切り口から検索クエリを生成する"""
        mock_queries = SearchQueries(
            queries=["Python 入門 初心者", "Python プログラミング 基礎"],
            reasoning="初心者向けの基本情報を収集するため",
        )

        mock_research = ResearchResult(
            findings=[
                ResearchFinding(
                    topic="Python基礎",
                    summary="Pythonは初心者に最適な言語",
                    source_title="Python.org",
                    source_url="https://python.org",
                ),
            ],
            sources=[
                SourceReference(title="Python.org", url="https://python.org"),
            ],
            summary="Pythonに関する基本情報を収集した",
        )

        mock_search_results = [
            SearchResult(
                title="Python入門",
                link="https://example.com/python",
                snippet="Pythonの基本を解説",
            ),
        ]

        with (
            patch("src.agents.writer.nodes.get_structured_model") as mock_structured,
            patch("src.agents.writer.nodes.search_web") as mock_search,
        ):
            # クエリ生成モデル
            mock_query_model = MagicMock()
            mock_query_model.invoke.return_value = mock_queries

            # 要約モデル
            mock_summary_model = MagicMock()
            mock_summary_model.invoke.return_value = mock_research

            mock_structured.side_effect = lambda schema: (
                mock_query_model if schema == SearchQueries else mock_summary_model
            )

            mock_search.invoke.return_value = mock_search_results

            node = ResearchNode()
            state = _create_base_state()
            result = node(state)

            assert "research_result" in result
            assert isinstance(result["research_result"], ResearchResult)
            assert len(result["research_result"].findings) == 1

            # クエリ生成モデルが呼ばれたことを確認
            mock_query_model.invoke.assert_called_once()

    def test_calls_search_web_for_each_query(self):
        """各クエリに対してsearch_webを呼び出す"""
        mock_queries = SearchQueries(
            queries=["query1", "query2", "query3"],
            reasoning="3つの検索を実行",
        )

        mock_research = ResearchResult(
            findings=[],
            sources=[],
            summary="検索完了",
        )

        mock_search_results = [
            SearchResult(
                title="Result",
                link="https://example.com",
                snippet="Snippet",
            ),
        ]

        with (
            patch("src.agents.writer.nodes.get_structured_model") as mock_structured,
            patch("src.agents.writer.nodes.search_web") as mock_search,
        ):
            mock_query_model = MagicMock()
            mock_query_model.invoke.return_value = mock_queries
            mock_summary_model = MagicMock()
            mock_summary_model.invoke.return_value = mock_research
            mock_structured.side_effect = lambda schema: (
                mock_query_model if schema == SearchQueries else mock_summary_model
            )
            mock_search.invoke.return_value = mock_search_results

            node = ResearchNode()
            state = _create_base_state()
            node(state)

            assert mock_search.invoke.call_count == 3


class TestResearchNodeSkip:
    """ResearchNode のスキップ条件テスト"""

    def test_skips_when_no_selected_angle(self):
        """selected_angleがNoneの場合はスキップ"""
        node = ResearchNode()
        state = _create_base_state()
        state["selected_angle"] = None

        result = node(state)
        assert result == {}

    def test_skips_when_no_angle_proposals(self):
        """angle_proposalsがNoneの場合はスキップ"""
        node = ResearchNode()
        state = _create_base_state()
        state["angle_proposals"] = None

        result = node(state)
        assert result == {}


class TestResearchNodeSummarization:
    """ResearchNode の結果要約テスト"""

    def test_summarizes_search_results(self):
        """検索結果を要約してResearchResultを返す"""
        mock_queries = SearchQueries(
            queries=["Python 型ヒント"],
            reasoning="型ヒントについて調査",
        )

        expected_findings = [
            ResearchFinding(
                topic="型ヒント",
                summary="Python 3.5から導入された型注釈機能",
                source_title="Python Docs",
                source_url="https://docs.python.org",
            ),
        ]
        expected_sources = [
            SourceReference(title="Python Docs", url="https://docs.python.org"),
        ]
        mock_research = ResearchResult(
            findings=expected_findings,
            sources=expected_sources,
            summary="型ヒントに関する情報を収集",
        )

        mock_search_results = [
            SearchResult(
                title="Python Docs - typing",
                link="https://docs.python.org",
                snippet="型ヒントの使い方",
            ),
        ]

        with (
            patch("src.agents.writer.nodes.get_structured_model") as mock_structured,
            patch("src.agents.writer.nodes.search_web") as mock_search,
        ):
            mock_query_model = MagicMock()
            mock_query_model.invoke.return_value = mock_queries
            mock_summary_model = MagicMock()
            mock_summary_model.invoke.return_value = mock_research
            mock_structured.side_effect = lambda schema: (
                mock_query_model if schema == SearchQueries else mock_summary_model
            )
            mock_search.invoke.return_value = mock_search_results

            node = ResearchNode()
            state = _create_base_state()
            result = node(state)

            research = result["research_result"]
            assert research.summary == "型ヒントに関する情報を収集"
            assert len(research.findings) == 1
            assert research.findings[0].topic == "型ヒント"
            assert len(research.sources) == 1


class TestResearchNodeSearchError:
    """ResearchNode の検索エラーハンドリングテスト"""

    def test_handles_search_error_gracefully(self):
        """検索エラー時もResearchResultを返す"""
        mock_queries = SearchQueries(
            queries=["query that fails"],
            reasoning="テスト",
        )

        mock_research = ResearchResult(
            findings=[],
            sources=[],
            summary="検索に失敗したが処理を継続",
        )

        with (
            patch("src.agents.writer.nodes.get_structured_model") as mock_structured,
            patch("src.agents.writer.nodes.search_web") as mock_search,
        ):
            mock_query_model = MagicMock()
            mock_query_model.invoke.return_value = mock_queries
            mock_summary_model = MagicMock()
            mock_summary_model.invoke.return_value = mock_research
            mock_structured.side_effect = lambda schema: (
                mock_query_model if schema == SearchQueries else mock_summary_model
            )
            mock_search.invoke.side_effect = Exception("Search API error")

            node = ResearchNode()
            state = _create_base_state()
            result = node(state)

            assert "research_result" in result
            assert isinstance(result["research_result"], ResearchResult)
