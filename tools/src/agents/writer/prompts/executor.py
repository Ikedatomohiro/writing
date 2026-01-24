"""Executor node prompt configuration."""

from src.core.nodes import PromptConfig

EXECUTOR_SYSTEM_PROMPT = """あなたはプロのライターです。
与えられたセクションの見出しと説明に基づいて、高品質な本文を執筆してください。

以下の点を意識してください：
- 指定されたキーワードを自然に組み込む
- 読みやすい文章構成
- 具体的で価値のある情報を提供
- 指定されたトーンを維持"""

EXECUTOR_USER_PROMPT_TEMPLATE = """以下のセクションの本文を執筆してください。

## 記事トピック
{topic}

## セクション見出し
{heading}（H{level}）

## セクションの概要
{description}

## 使用するキーワード
{keywords}

## トーン
{tone}

このセクションの本文を執筆してください。"""

EXECUTOR_PROMPT_CONFIG = PromptConfig(
    system_prompt=EXECUTOR_SYSTEM_PROMPT,
    user_prompt_template=EXECUTOR_USER_PROMPT_TEMPLATE,
)
