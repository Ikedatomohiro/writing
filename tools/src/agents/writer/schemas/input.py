"""Writer agent input schemas."""

from pydantic import BaseModel, Field, field_validator


class WriterInput(BaseModel):
    """記事生成エージェントの入力スキーマ"""

    topic: str = Field(description="記事のトピック")
    keywords: list[str] = Field(description="使用するキーワード")
    target_length: int = Field(default=2000, description="目標文字数")
    tone: str = Field(default="informative", description="トーン")

    @field_validator("keywords")
    @classmethod
    def keywords_not_empty(cls, v: list[str]) -> list[str]:
        if not v:
            raise ValueError("keywords must not be empty")
        return v
