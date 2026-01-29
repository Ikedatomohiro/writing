"""Persona configuration schema and loader."""

from pathlib import Path

import yaml
from pydantic import BaseModel, Field

from src.common import get_logger

logger = get_logger(__name__)

# デフォルトのペルソナ設定ファイルパス
_DEFAULT_PERSONA_PATH = Path(__file__).parent.parent.parent.parent / "config" / "persona.yaml"


class WritingStyle(BaseModel):
    """執筆スタイル設定"""

    tone: str = Field(description="文章のトーン")
    target_audience: str = Field(description="想定読者層")
    avoid: list[str] = Field(default_factory=list, description="避けるべき表現")


class PersonaConfig(BaseModel):
    """ペルソナプロファイル"""

    name: str = Field(description="著者名またはペンネーム")
    background: str = Field(description="経歴・専門分野・実績")
    values: list[str] = Field(description="価値観・信条")
    writing_style: WritingStyle = Field(description="執筆スタイル")
    unique_perspectives: list[str] = Field(
        default_factory=list, description="独自の視点"
    )
    category_expertise: dict[str, str] = Field(
        default_factory=dict, description="カテゴリ別の専門性"
    )


def load_persona(path: Path | None = None) -> PersonaConfig | None:
    """YAMLファイルからペルソナ設定を読み込む。

    Args:
        path: ペルソナ設定ファイルのパス。Noneの場合はデフォルトパスを使用。

    Returns:
        PersonaConfig or None（ファイルが見つからない場合）
    """
    persona_path = path or _DEFAULT_PERSONA_PATH

    if not persona_path.exists():
        logger.info(f"ペルソナ設定ファイルが見つかりません: {persona_path}")
        return None

    with open(persona_path, encoding="utf-8") as f:
        data = yaml.safe_load(f)

    persona_data = data.get("persona", {})
    return PersonaConfig(**persona_data)


def format_persona_context(persona: PersonaConfig | None) -> str:
    """ペルソナ情報をプロンプト注入用のテキストに変換する。

    Args:
        persona: ペルソナ設定。Noneの場合は空文字列を返す。

    Returns:
        プロンプトに注入するペルソナコンテキスト文字列
    """
    if persona is None:
        return ""

    parts = [
        f"## 著者ペルソナ: {persona.name}",
        f"\n### 経歴\n{persona.background}",
    ]

    if persona.values:
        values_text = "\n".join(f"- {v}" for v in persona.values)
        parts.append(f"\n### 価値観\n{values_text}")

    style = persona.writing_style
    parts.append(f"\n### 執筆スタイル\n- トーン: {style.tone}")
    parts.append(f"- 想定読者: {style.target_audience}")

    if style.avoid:
        avoid_text = ", ".join(style.avoid)
        parts.append(f"- 避けるべき表現: {avoid_text}")

    if persona.unique_perspectives:
        perspectives_text = "\n".join(
            f"- {p}" for p in persona.unique_perspectives
        )
        parts.append(f"\n### 独自の視点\n{perspectives_text}")

    if persona.category_expertise:
        expertise_text = "\n".join(
            f"- {k}: {v}" for k, v in persona.category_expertise.items()
        )
        parts.append(f"\n### 専門分野\n{expertise_text}")

    return "\n".join(parts)
