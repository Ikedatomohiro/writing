"""カテゴリ専門化設定モジュール.

カテゴリ（資産形成・プログラミング・健康）ごとの専門用語・トーン・構成パターンを
管理する。ペルソナ設定（#38）を補完する設計。
"""

from pathlib import Path

import yaml
from pydantic import BaseModel, Field, field_validator

from .config import settings


class ExpertiseConfig(BaseModel):
    """カテゴリの専門知識設定."""

    topics: list[str] = Field(min_length=1, description="専門トピック一覧")
    terminology_level: str = Field(description="専門用語レベルの説明")

    @field_validator("topics")
    @classmethod
    def topics_not_empty(cls, v: list[str]) -> list[str]:
        if not v:
            raise ValueError("topics must not be empty")
        return v


class WritingStyleConfig(BaseModel):
    """カテゴリの文体設定."""

    tone: str = Field(description="文体のトーン")
    structure: list[str] = Field(description="推奨する構成パターン")
    avoid: list[str] = Field(description="避けるべき表現")


class CategorySpecConfig(BaseModel):
    """カテゴリ専門化設定.

    各カテゴリの専門知識・文体・構成パターンを定義する。
    """

    name: str = Field(description="カテゴリ日本語名")
    slug: str = Field(description="カテゴリ識別子（英語）")
    expertise: ExpertiseConfig = Field(description="専門知識設定")
    writing_style: WritingStyleConfig = Field(description="文体設定")
    common_sections: list[str] = Field(description="よく使うセクション名")

    @field_validator("slug")
    @classmethod
    def slug_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("slug must not be empty")
        return v

    def to_prompt_context(self) -> str:
        """プロンプト注入用のコンテキスト文字列を生成."""
        topics = "\n".join(f"  - {t}" for t in self.expertise.topics)
        structure = "\n".join(f"  - {s}" for s in self.writing_style.structure)
        avoid = "\n".join(f"  - {a}" for a in self.writing_style.avoid)
        sections = "\n".join(f"  - {s}" for s in self.common_sections)

        return (
            f"## カテゴリ: {self.name}\n\n"
            f"### 専門トピック\n{topics}\n\n"
            f"### 用語レベル\n{self.expertise.terminology_level}\n\n"
            f"### トーン\n{self.writing_style.tone}\n\n"
            f"### 推奨構成パターン\n{structure}\n\n"
            f"### 避けるべき表現\n{avoid}\n\n"
            f"### よく使うセクション\n{sections}"
        )


def get_category_config_dir() -> Path:
    """カテゴリ設定ディレクトリのパスを取得."""
    return settings.project_root / "config" / "categories"


def load_category_config(config_path: Path) -> CategorySpecConfig:
    """1つのカテゴリ設定YAMLを読み込む.

    Args:
        config_path: YAMLファイルのパス

    Returns:
        CategorySpecConfig インスタンス

    Raises:
        FileNotFoundError: ファイルが見つからない場合
        ValueError: ファイルが空または不正な場合
    """
    if not config_path.exists():
        raise FileNotFoundError(f"カテゴリ設定ファイルが見つかりません: {config_path}")

    with config_path.open(encoding="utf-8") as f:
        data = yaml.safe_load(f)

    if data is None:
        raise ValueError(f"カテゴリ設定ファイルが空です: {config_path}")

    category_data = data.get("category", data)
    return CategorySpecConfig.model_validate(category_data)


def load_all_categories(
    config_dir: Path | None = None,
) -> dict[str, CategorySpecConfig]:
    """全カテゴリ設定を読み込む.

    Args:
        config_dir: カテゴリ設定ディレクトリ（省略時はデフォルト）

    Returns:
        slug → CategorySpecConfig のマッピング

    Raises:
        FileNotFoundError: ディレクトリが見つからない場合
    """
    directory = config_dir or get_category_config_dir()

    if not directory.exists():
        raise FileNotFoundError(f"カテゴリ設定ディレクトリが見つかりません: {directory}")

    categories: dict[str, CategorySpecConfig] = {}

    for yaml_file in sorted(directory.glob("*.yaml")):
        config = load_category_config(yaml_file)
        categories[config.slug] = config

    return categories


def load_category_config_by_slug(
    slug: str, config_dir: Path | None = None
) -> CategorySpecConfig | None:
    """slugからカテゴリ設定を取得する.

    Args:
        slug: カテゴリ識別子（例: "asset", "programming", "health"）
        config_dir: カテゴリ設定ディレクトリ（省略時はデフォルト）

    Returns:
        CategorySpecConfig またはカテゴリが見つからない場合は None
    """
    try:
        categories = load_all_categories(config_dir)
        return categories.get(slug)
    except FileNotFoundError:
        return None
