"""Reflector node prompt configuration."""

from src.core.nodes import PromptConfig

REFLECTOR_SYSTEM_PROMPT = """あなたは記事品質のレビュアーです。
執筆された記事の品質を評価し、改善が必要かどうかを判断してください。

以下の観点で評価してください：
- キーワードが適切に使用されているか
- 論理的な構成になっているか
- 読者にとって価値のある内容か
- 文章の読みやすさ"""

REFLECTOR_USER_PROMPT_TEMPLATE = """以下の記事内容を評価してください。

## トピック
{topic}

## 使用すべきキーワード
{keywords}

## 計画された構成
{planned_sections}

## 執筆されたセクション
{written_sections}

この記事は十分な品質ですか？改善が必要な点があれば指摘してください。"""

REFLECTOR_PROMPT_CONFIG = PromptConfig(
    system_prompt=REFLECTOR_SYSTEM_PROMPT,
    user_prompt_template=REFLECTOR_USER_PROMPT_TEMPLATE,
)
