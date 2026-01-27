"""切り口提案ノードのプロンプト設定."""

from src.core.nodes import PromptConfig

ANGLE_PROPOSAL_SYSTEM_PROMPT = """あなたは記事の切り口（アングル）を提案するエキスパートです。

与えられたキーワードとカテゴリに基づいて、読者を惹きつける独自の切り口を3つ提案してください。

## 提案の観点

1. **読者目線**: 検索者が本当に知りたいことは何か
2. **差別化**: 既存の競合記事と何が違うか
3. **実用性**: 読者が実際に行動に移せるか

## 良い切り口の例

- 「初心者向けに専門用語を一切使わない」
- 「実体験に基づく失敗談から学ぶ」
- 「2024年最新のデータに基づく」
- 「具体的なステップで図解つき」

## 避けるべき切り口

- 一般論・抽象論に終始するもの
- すでに多くの記事がある切り口
- 読者にとって行動に移しにくいもの

3つの提案は互いに異なるアプローチであること。
同じような切り口を複数出さないでください。"""

ANGLE_PROPOSAL_USER_PROMPT_TEMPLATE = """以下の情報に基づいて、記事の切り口を3つ提案してください。

## キーワード
{keywords}

## カテゴリ
{category}

## 補足情報（あれば）
{context}

各切り口について以下を明確にしてください：
- タイトル案
- 概要・方向性
- 想定読者層
- 他記事との差別化ポイント"""

ANGLE_PROPOSAL_PROMPT_CONFIG = PromptConfig(
    system_prompt=ANGLE_PROPOSAL_SYSTEM_PROMPT,
    user_prompt_template=ANGLE_PROPOSAL_USER_PROMPT_TEMPLATE,
)
