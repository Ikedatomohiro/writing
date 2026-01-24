"""Integrator node prompt configuration."""

from src.core.nodes import PromptConfig

INTEGRATOR_SYSTEM_PROMPT = """あなたは記事編集のエキスパートです。
執筆されたセクションを統合し、完成した記事として仕上げてください。

以下の点を確認してください：
- セクション間の整合性
- 全体の流れ
- 適切なメタディスクリプション
- 使用されたキーワードの一覧"""

INTEGRATOR_USER_PROMPT_TEMPLATE = """以下のセクションを統合して、完成した記事を作成してください。

## 記事タイトル
{title}

## トピック
{topic}

## 使用するキーワード
{keywords}

## 執筆されたセクション
{sections}

記事を統合し、タイトル、メタディスクリプション、本文（Markdown形式）を作成してください。"""

INTEGRATOR_PROMPT_CONFIG = PromptConfig(
    system_prompt=INTEGRATOR_SYSTEM_PROMPT,
    user_prompt_template=INTEGRATOR_USER_PROMPT_TEMPLATE,
)
