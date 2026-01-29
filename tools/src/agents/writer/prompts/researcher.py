"""Researcher node prompt configurations."""

from src.core.nodes import PromptConfig

QUERY_GENERATOR_SYSTEM_PROMPT = """あなたはリサーチの専門家です。
記事のトピックと切り口に基づいて、最も効果的なWeb検索クエリを生成してください。

以下の点を考慮してください：
- 信頼性の高い情報源にヒットしやすいクエリ
- 最新の情報を取得できるクエリ
- 統計データや具体的な事実を含む結果が得られるクエリ
- 日本語での検索を優先"""

QUERY_GENERATOR_USER_PROMPT_TEMPLATE = """以下の記事のために、Web検索クエリを生成してください。

## トピック
{topic}

## 記事の切り口
{angle_title}
{angle_summary}

## 使用するキーワード
{keywords}

効果的な検索クエリを1〜5個生成してください。"""

QUERY_GENERATOR_PROMPT_CONFIG = PromptConfig(
    system_prompt=QUERY_GENERATOR_SYSTEM_PROMPT,
    user_prompt_template=QUERY_GENERATOR_USER_PROMPT_TEMPLATE,
)

RESEARCH_SUMMARIZER_SYSTEM_PROMPT = """あなたはリサーチ結果を整理・要約する専門家です。
Web検索の結果を分析し、記事の執筆に役立つ情報を構造化してください。

以下の点を意識してください：
- 信頼性の高い情報を優先
- 統計データや具体的な事実を抽出
- 出典を明確に記録
- 記事の切り口に関連する情報を重点的に"""

RESEARCH_SUMMARIZER_USER_PROMPT_TEMPLATE = """以下の検索結果を分析し、記事執筆に役立つ情報を整理してください。

## 記事トピック
{topic}

## 記事の切り口
{angle_title}

## 使用するキーワード
{keywords}

## 検索結果
{search_results}

検索結果から、記事に活用できる情報を抽出・要約してください。"""

RESEARCH_SUMMARIZER_PROMPT_CONFIG = PromptConfig(
    system_prompt=RESEARCH_SUMMARIZER_SYSTEM_PROMPT,
    user_prompt_template=RESEARCH_SUMMARIZER_USER_PROMPT_TEMPLATE,
)
