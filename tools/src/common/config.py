"""設定管理モジュール"""

import os
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """アプリケーション設定"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    # API Keys
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    serpapi_api_key: str = Field(default="", alias="SERPAPI_API_KEY")

    # LLM設定
    default_model: str = "gpt-4o-mini"
    temperature: float = 0.7
    max_tokens: int = 4096

    # エージェント設定
    max_retry_count: int = 3
    max_search_results: int = 10

    # パス設定
    project_root: Path = Path(__file__).parent.parent.parent
    data_dir: Path = project_root / "data"


# シングルトンインスタンス
settings = Settings()
