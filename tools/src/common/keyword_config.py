"""キーワード設定読み込みモジュール"""

from pathlib import Path

import yaml
from pydantic import BaseModel, Field, field_validator

from .config import settings


class CategoryConfig(BaseModel):
    """カテゴリ設定"""

    description: str = ""
    seed_keywords: list[str] = Field(min_length=1)
    depth: int = Field(default=2, ge=1, le=3)

    @field_validator("seed_keywords")
    @classmethod
    def validate_seed_keywords(cls, v: list[str]) -> list[str]:
        if not v:
            raise ValueError("シードキーワードは最低1つ必要です")
        return v


class KeywordConfig(BaseModel):
    """キーワード設定全体"""

    version: str = "1.0"
    categories: dict[str, CategoryConfig]
    defaults: dict[str, int | bool] = Field(default_factory=dict)

    def get_category(self, name: str) -> CategoryConfig:
        """カテゴリ設定を取得"""
        if name not in self.categories:
            available = ", ".join(self.categories.keys())
            raise KeyError(f"カテゴリ '{name}' が見つかりません。利用可能: {available}")
        return self.categories[name]

    def list_categories(self) -> list[str]:
        """カテゴリ名の一覧を取得"""
        return list(self.categories.keys())


def get_config_path() -> Path:
    """設定ファイルのパスを取得"""
    return settings.project_root / "config" / "keywords.yaml"


def load_keyword_config(config_path: Path | None = None) -> KeywordConfig:
    """キーワード設定を読み込む"""
    path = config_path or get_config_path()

    if not path.exists():
        raise FileNotFoundError(f"設定ファイルが見つかりません: {path}")

    with path.open(encoding="utf-8") as f:
        data = yaml.safe_load(f)

    if data is None:
        raise ValueError(f"設定ファイルが空です: {path}")

    return KeywordConfig.model_validate(data)
