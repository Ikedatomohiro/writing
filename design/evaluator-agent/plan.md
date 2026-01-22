# 評価エージェント実装計画

## 1. 実装方針

`keyword_finder` エージェントの構造を踏襲し、LangGraphベースのワークフローとして実装する。

## 2. ディレクトリ構成

```
tools/src/agents/evaluator/
├── __init__.py
├── agent.py              # メインエージェント（LangGraphワークフロー）
├── prompts/
│   ├── __init__.py
│   ├── goal_creator.py   # 評価目標・基準策定プロンプト
│   ├── planner.py        # 評価計画立案プロンプト
│   ├── executor.py       # 情報収集・評価実行プロンプト
│   ├── reflector.py      # 評価十分性検証プロンプト
│   └── integrator.py     # 結果統合プロンプト
└── schemas/
    ├── __init__.py
    ├── input.py          # 入力スキーマ
    ├── output.py         # 出力スキーマ
    └── state.py          # エージェント状態スキーマ
```

## 3. 実装ステップ

### Phase 1: スキーマ定義

#### Step 1.1: 入力スキーマ（schemas/input.py）
- `EvaluationInput` クラス
  - `target`: str（評価対象）
  - `target_type`: Literal["article", "service", "product", "other"]
  - `evaluation_request`: str（評価依頼内容）
  - `context`: str | None（追加コンテキスト）

#### Step 1.2: 出力スキーマ（schemas/output.py）
- `CriterionScore` クラス（基準別スコア）
- `EvaluationOutput` クラス（最終出力）
- `ClarificationQuestion` クラス（質問）
- `GoalCreatorOutput` クラス（GoalCreator出力）

#### Step 1.3: 状態スキーマ（schemas/state.py）
- `EvaluationGoal` クラス
- `EvaluationPlan` クラス
- `EvaluationResult` クラス
- `ReflectionResult` クラス
- `AgentState` TypedDict

### Phase 2: プロンプト作成

#### Step 2.1: goal_creator.py
- 評価対象の種類判別
- 評価基準の自動生成
- 不明点の質問生成

#### Step 2.2: planner.py
- 評価計画の立案
- 必要な調査項目の特定

#### Step 2.3: executor.py
- 情報収集の実行
- 評価の実行

#### Step 2.4: reflector.py
- 評価の十分性検証
- 追加調査の必要性判断

#### Step 2.5: integrator.py
- 結果の統合
- スコア・長所・短所・改善点の整理

### Phase 3: エージェント実装

#### Step 3.1: agent.py
- LangGraphワークフロー定義
- 各ノードの実装
  - `goal_creator_node`
  - `planner_node`
  - `executor_node`
  - `reflector_node`
  - `integrator_node`
- 条件分岐（should_continue）
- グラフのコンパイル

#### Step 3.2: ツール統合
- `search_web` ツールの利用

### Phase 4: テスト

#### Step 4.1: スキーマテスト
- 入力バリデーション
- 出力形式の検証

#### Step 4.2: 各ノードの単体テスト
- モックを使用した各ノードのテスト

#### Step 4.3: 統合テスト
- エンドツーエンドのフローテスト

### Phase 5: main.py統合

- `run_evaluator` 関数の追加
- CLI対応

## 4. 依存関係

- LangGraph
- LangChain
- Pydantic
- 既存の `search_web` ツール

## 5. リスクと対策

| リスク | 対策 |
|--------|------|
| 評価基準の生成が不適切 | デフォルト基準テンプレートを用意 |
| 無限ループ | 最大リトライ回数（5回）を設定 |
| 質問が多すぎる | 質問数を3つ以下に制限 |

## 6. 影響を受けるファイル

**新規作成**:
- `tools/src/agents/evaluator/` 配下全ファイル
- `tools/tests/agents/test_evaluator.py`

**変更**:
- `tools/main.py`（エントリポイント追加）
