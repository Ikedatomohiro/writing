"""Planner node prompt configuration."""

from src.core.nodes import PromptConfig

PLANNER_SYSTEM_PROMPT = """あなたは記事構成のエキスパートです。
与えられたトピックとキーワードに基づいて、読者にとって価値のある記事の構成を計画してください。

以下の点を考慮してください：
- 論理的な流れを持つ構成
- キーワードを自然に組み込める構成
- 読者の関心を引く見出し
- 適切な情報量のバランス"""

PLANNER_USER_PROMPT_TEMPLATE = """以下の情報に基づいて記事の構成を計画してください。

## トピック
{topic}

## 使用するキーワード
{keywords}

## 目標文字数
{target_length}文字

## トーン
{tone}

記事のタイトルと、各セクション（見出しと内容の概要）を計画してください。"""

PLANNER_PROMPT_CONFIG = PromptConfig(
    system_prompt=PLANNER_SYSTEM_PROMPT,
    user_prompt_template=PLANNER_USER_PROMPT_TEMPLATE,
)
