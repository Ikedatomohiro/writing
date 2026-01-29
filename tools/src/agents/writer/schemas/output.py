"""Writer agent output schemas."""

from pydantic import BaseModel, Field, field_validator

from src.agents.writer.schemas.research import SourceReference
from src.core.schemas import BaseReflection


class PlannedSection(BaseModel):
    """計画されたセクション"""

    heading: str = Field(description="セクションの見出し")
    level: int = Field(description="見出しレベル（2または3）")
    description: str = Field(description="セクションの内容説明")

    @field_validator("level")
    @classmethod
    def level_must_be_valid(cls, v: int) -> int:
        if v < 2 or v > 4:
            raise ValueError("level must be between 2 and 4")
        return v


class ArticlePlan(BaseModel):
    """記事の構成計画"""

    title: str = Field(description="記事タイトル")
    sections: list[PlannedSection] = Field(description="セクション一覧")


class Section(BaseModel):
    """執筆されたセクション"""

    heading: str = Field(description="セクションの見出し")
    level: int = Field(description="見出しレベル（2または3）")
    content: str = Field(description="セクションの本文")

    @field_validator("level")
    @classmethod
    def level_must_be_valid(cls, v: int) -> int:
        if v < 2 or v > 4:
            raise ValueError("level must be between 2 and 4")
        return v


class ReflectionResult(BaseReflection):
    """記事品質の内省結果"""

    missing_keywords: list[str] = Field(
        default_factory=list, description="使用されていないキーワード"
    )
    quality_issues: list[str] = Field(
        default_factory=list, description="品質上の問題点"
    )


class SeoMetadata(BaseModel):
    """SEO最適化メタデータ"""

    primary_keyword: str = Field(description="メインキーワード")
    keyword_density: float = Field(description="キーワード密度（%）")
    title_length: int = Field(description="タイトル文字数")
    description_length: int = Field(description="ディスクリプション文字数")
    co_occurrence_words: list[str] = Field(
        default_factory=list, description="共起語リスト"
    )
    heading_keywords: list[str] = Field(
        default_factory=list, description="見出しに含まれるキーワード"
    )
    seo_score: int = Field(description="SEOスコア（0-100）")
    improvements_applied: list[str] = Field(
        default_factory=list, description="適用した改善リスト"
    )

    @field_validator("seo_score")
    @classmethod
    def seo_score_must_be_valid(cls, v: int) -> int:
        if v < 0 or v > 100:
            raise ValueError("seo_score must be between 0 and 100")
        return v


class SeoOptimizationResult(BaseModel):
    """SEO最適化ノードのLLM出力スキーマ"""

    optimized_title: str = Field(description="SEO最適化されたタイトル")
    optimized_description: str = Field(
        description="最適化されたメタディスクリプション（120-160文字）"
    )
    optimized_content: str = Field(
        description="キーワード配置・共起語を最適化した本文（Markdown形式）"
    )
    primary_keyword: str = Field(description="メインキーワード")
    keyword_density: float = Field(description="キーワード密度（%）")
    co_occurrence_words: list[str] = Field(
        default_factory=list, description="使用した共起語リスト"
    )
    seo_score: int = Field(description="SEOスコア（0-100）")
    improvements_applied: list[str] = Field(
        default_factory=list, description="適用した改善リスト"
    )


class WriterOutput(BaseModel):
    """記事生成エージェントの出力スキーマ"""

    title: str = Field(description="記事タイトル")
    description: str = Field(description="記事概要（メタディスクリプション用）")
    content: str = Field(description="記事本文（Markdown形式）")
    keywords_used: list[str] = Field(description="実際に使用したキーワード")
    sections: list[Section] = Field(description="セクション情報")
    summary: str = Field(description="執筆結果のサマリー")
    references: list[SourceReference] = Field(
        default_factory=list,
        description="参考リンクのリスト",
    )
    seo_metadata: SeoMetadata | None = Field(
        default=None, description="SEO最適化メタデータ"
    )
