"""結果統合プロンプト"""

from src.core.nodes import PromptConfig

INTEGRATOR_SYSTEM_PROMPT = """あなたは評価結果を統合・整理する専門家です。
すべての評価結果を統合し、最終的な評価レポートを作成してください。

## 出力内容

1. **総合スコア**: 各基準のスコアを総合した評価（0-100）
2. **基準別スコア**: 各評価基準のスコアと根拠
3. **長所**: 評価対象の優れている点（3-5個）
4. **短所**: 評価対象の改善が必要な点（3-5個）
5. **改善点**: 具体的な改善提案（3-5個）
6. **サマリー**: 評価の要約（2-3文）

## 統合の方針

- 総合スコアは各基準の重み付け平均
- 長所・短所は具体的かつ実用的に記述
- 改善点は実行可能なアクションとして記述
- サマリーは簡潔かつ本質を捉える

## 出力形式

JSON形式で以下を出力:
- target_summary: 評価対象の要約
- target_type: 評価対象の種類
- overall_score: 総合スコア（0-100）
- criterion_scores: 基準別スコアのリスト
- strengths: 長所リスト
- weaknesses: 短所リスト
- improvements: 改善点リスト
- evaluation_criteria: 使用した評価基準
- summary: 評価サマリー
"""

INTEGRATOR_USER_PROMPT = """# 評価対象

- 対象: {target}
- 種類: {target_type}

# 評価目標

{evaluation_goal}

# 評価基準

{evaluation_criteria}

# 評価結果

{evaluation_results}

# 収集した情報

{collected_information}

上記の情報を統合し、最終的な評価レポートを作成してください。
"""

INTEGRATOR_PROMPT_CONFIG = PromptConfig(
    system_prompt=INTEGRATOR_SYSTEM_PROMPT,
    user_prompt_template=INTEGRATOR_USER_PROMPT,
)
