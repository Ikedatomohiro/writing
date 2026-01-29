"""Research schema tests."""

import pytest

from src.agents.writer.schemas.research import (
    ResearchFinding,
    ResearchResult,
    SearchQueries,
    SourceReference,
)


class TestSourceReference:
    """SourceReference schema tests"""

    def test_valid_source_reference(self):
        ref = SourceReference(
            title="Python公式ドキュメント",
            url="https://docs.python.org/ja/3/",
        )
        assert ref.title == "Python公式ドキュメント"
        assert ref.url == "https://docs.python.org/ja/3/"

    def test_empty_title_raises_error(self):
        with pytest.raises(ValueError):
            SourceReference(title="", url="https://example.com")

    def test_empty_url_raises_error(self):
        with pytest.raises(ValueError):
            SourceReference(title="Example", url="")


class TestResearchFinding:
    """ResearchFinding schema tests"""

    def test_valid_finding(self):
        finding = ResearchFinding(
            topic="Pythonの型ヒント",
            summary="Python 3.5以降で型ヒントが導入された。",
            source_title="Python公式ドキュメント",
            source_url="https://docs.python.org/ja/3/library/typing.html",
        )
        assert finding.topic == "Pythonの型ヒント"
        assert "型ヒント" in finding.summary

    def test_empty_topic_raises_error(self):
        with pytest.raises(ValueError):
            ResearchFinding(
                topic="",
                summary="内容",
                source_title="出典",
                source_url="https://example.com",
            )

    def test_empty_summary_raises_error(self):
        with pytest.raises(ValueError):
            ResearchFinding(
                topic="トピック",
                summary="",
                source_title="出典",
                source_url="https://example.com",
            )


class TestSearchQueries:
    """SearchQueries schema tests"""

    def test_valid_queries(self):
        queries = SearchQueries(
            queries=["Python 型ヒント 使い方", "Python typing モジュール"],
            reasoning="型ヒントの基本と応用を調べるため",
        )
        assert len(queries.queries) == 2
        assert queries.reasoning != ""

    def test_empty_queries_raises_error(self):
        with pytest.raises(ValueError):
            SearchQueries(queries=[], reasoning="理由")

    def test_max_queries_limit(self):
        queries = SearchQueries(
            queries=[f"query {i}" for i in range(5)],
            reasoning="多角的に調査",
        )
        assert len(queries.queries) == 5

    def test_over_max_queries_raises_error(self):
        with pytest.raises(ValueError):
            SearchQueries(
                queries=[f"query {i}" for i in range(6)],
                reasoning="多すぎる",
            )


class TestResearchResult:
    """ResearchResult schema tests"""

    def test_valid_result(self):
        result = ResearchResult(
            findings=[
                ResearchFinding(
                    topic="Python基礎",
                    summary="Pythonは汎用プログラミング言語",
                    source_title="Wikipedia",
                    source_url="https://ja.wikipedia.org/wiki/Python",
                ),
            ],
            sources=[
                SourceReference(
                    title="Wikipedia",
                    url="https://ja.wikipedia.org/wiki/Python",
                ),
            ],
            summary="Pythonに関する基本情報を収集した",
        )
        assert len(result.findings) == 1
        assert len(result.sources) == 1
        assert "Python" in result.summary

    def test_empty_findings_allowed(self):
        result = ResearchResult(
            findings=[],
            sources=[],
            summary="検索結果が見つからなかった",
        )
        assert len(result.findings) == 0

    def test_empty_summary_raises_error(self):
        with pytest.raises(ValueError):
            ResearchResult(
                findings=[],
                sources=[],
                summary="",
            )
