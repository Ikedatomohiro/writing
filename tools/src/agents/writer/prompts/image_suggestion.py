"""Image suggestion node prompt configuration."""

from src.core.nodes import PromptConfig

IMAGE_SUGGESTION_SYSTEM_PROMPT = """あなたは画像選定の専門家です。
記事の内容に最適な画像の検索クエリを英語で生成してください。

以下のルールに従ってください：
- 検索クエリは英語で、Unsplash APIでの検索に適した形式にする
- アイキャッチ画像は記事全体のテーマを表現するもの
- 本文挿入画像は各セクションの内容を補足するもの
- 抽象的すぎず、具体的なビジュアルをイメージできるクエリにする
- 1クエリ2〜5単語程度"""

IMAGE_SUGGESTION_USER_PROMPT_TEMPLATE = """以下の記事に適した画像の検索クエリを生成してください。

## 記事タイトル
{title}

## キーワード
{keywords}

## 記事本文（抜粋）
{content_excerpt}

## セクション一覧
{sections}

以下を生成してください：
1. アイキャッチ画像の検索クエリ（英語、2〜5単語）
2. 各セクションに適した本文挿入画像の検索クエリ（英語、各2〜5単語）
   - 画像が不要なセクションはスキップ可
3. OGP画像の検索クエリ（アイキャッチと異なる場合のみ）"""

IMAGE_SUGGESTION_PROMPT_CONFIG = PromptConfig(
    system_prompt=IMAGE_SUGGESTION_SYSTEM_PROMPT,
    user_prompt_template=IMAGE_SUGGESTION_USER_PROMPT_TEMPLATE,
)
