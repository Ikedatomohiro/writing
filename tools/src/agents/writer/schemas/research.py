"""Research-related schemas for writer agent."""

from pydantic import BaseModel, Field, field_validator


class SourceReference(BaseModel):
    """参考リンク"""

    title: str = Field(description="参考元のタイトル")
    url: str = Field(description="参考元のURL")

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("title must not be empty")
        return v

    @field_validator("url")
    @classmethod
    def url_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("url must not be empty")
        return v


class ResearchFinding(BaseModel):
    """リサーチで発見した情報"""

    topic: str = Field(description="発見した情報のトピック")
    summary: str = Field(description="情報の要約")
    source_title: str = Field(description="出典のタイトル")
    source_url: str = Field(description="出典のURL")

    @field_validator("topic")
    @classmethod
    def topic_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("topic must not be empty")
        return v

    @field_validator("summary")
    @classmethod
    def summary_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("summary must not be empty")
        return v


class SearchQueries(BaseModel):
    """検索クエリの生成結果"""

    queries: list[str] = Field(
        description="生成された検索クエリ（最大5件）",
        min_length=1,
        max_length=5,
    )
    reasoning: str = Field(description="クエリ生成の根拠")


class ResearchResult(BaseModel):
    """リサーチ結果"""

    findings: list[ResearchFinding] = Field(
        default_factory=list,
        description="発見した情報のリスト",
    )
    sources: list[SourceReference] = Field(
        default_factory=list,
        description="参考リンクのリスト",
    )
    summary: str = Field(description="リサーチ結果の全体要約")

    @field_validator("summary")
    @classmethod
    def summary_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("summary must not be empty")
        return v
