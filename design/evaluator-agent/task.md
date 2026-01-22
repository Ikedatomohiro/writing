# 評価エージェント タスクリスト

## Phase 1: スキーマ定義

### 1.1 入力スキーマ
- [ ] `tools/src/agents/evaluator/schemas/input.py` を作成
- [ ] `EvaluationInput` クラスを定義
  - [ ] `target`: str
  - [ ] `target_type`: Literal["article", "service", "product", "other"]
  - [ ] `evaluation_request`: str
  - [ ] `context`: str | None = None
- [ ] バリデーションを追加（target_typeの値チェック）

### 1.2 出力スキーマ
- [ ] `tools/src/agents/evaluator/schemas/output.py` を作成
- [ ] `CriterionScore` クラスを定義
  - [ ] `criterion`: str
  - [ ] `score`: int (0-100)
  - [ ] `rationale`: str
- [ ] `EvaluationOutput` クラスを定義
  - [ ] `target_summary`: str
  - [ ] `target_type`: str
  - [ ] `overall_score`: int (0-100)
  - [ ] `criterion_scores`: list[CriterionScore]
  - [ ] `strengths`: list[str]
  - [ ] `weaknesses`: list[str]
  - [ ] `improvements`: list[str]
  - [ ] `evaluation_criteria`: list[str]
  - [ ] `summary`: str
- [ ] `ClarificationQuestion` クラスを定義
- [ ] `GoalCreatorOutput` クラスを定義

### 1.3 状態スキーマ
- [ ] `tools/src/agents/evaluator/schemas/state.py` を作成
- [ ] `EvaluationGoal` クラスを定義
- [ ] `EvaluationPlan` クラスを定義
- [ ] `EvaluationResult` クラスを定義
- [ ] `ReflectionResult` クラスを定義
- [ ] `AgentState` TypedDictを定義

### 1.4 スキーマ初期化
- [ ] `tools/src/agents/evaluator/schemas/__init__.py` を作成
- [ ] 必要なクラスをエクスポート

---

## Phase 2: プロンプト作成

### 2.1 GoalCreatorプロンプト
- [ ] `tools/src/agents/evaluator/prompts/goal_creator.py` を作成
- [ ] `GOAL_CREATOR_SYSTEM_PROMPT` を定義
  - [ ] 評価対象の種類判別ロジック
  - [ ] 評価基準テンプレート（article, service, product）
  - [ ] 質問生成ガイドライン
- [ ] `GOAL_CREATOR_USER_PROMPT` を定義

### 2.2 Plannerプロンプト
- [ ] `tools/src/agents/evaluator/prompts/planner.py` を作成
- [ ] `PLANNER_SYSTEM_PROMPT` を定義
- [ ] `PLANNER_USER_PROMPT` を定義

### 2.3 Executorプロンプト
- [ ] `tools/src/agents/evaluator/prompts/executor.py` を作成
- [ ] `EXECUTOR_SYSTEM_PROMPT` を定義
  - [ ] 利用可能ツール（search_web）の説明
- [ ] `EXECUTOR_USER_PROMPT` を定義

### 2.4 Reflectorプロンプト
- [ ] `tools/src/agents/evaluator/prompts/reflector.py` を作成
- [ ] `REFLECTOR_SYSTEM_PROMPT` を定義
  - [ ] 評価十分性の判断基準
- [ ] `REFLECTOR_USER_PROMPT` を定義

### 2.5 Integratorプロンプト
- [ ] `tools/src/agents/evaluator/prompts/integrator.py` を作成
- [ ] `INTEGRATOR_SYSTEM_PROMPT` を定義
- [ ] `INTEGRATOR_USER_PROMPT` を定義

### 2.6 プロンプト初期化
- [ ] `tools/src/agents/evaluator/prompts/__init__.py` を作成
- [ ] 全プロンプトをエクスポート

---

## Phase 3: エージェント実装

### 3.1 エージェント基盤
- [ ] `tools/src/agents/evaluator/agent.py` を作成
- [ ] 必要なインポートを追加
- [ ] LLMの初期化

### 3.2 ノード実装
- [ ] `goal_creator_node` を実装
  - [ ] 評価目標の生成
  - [ ] 評価基準の策定
  - [ ] 質問生成（必要な場合）
- [ ] `planner_node` を実装
  - [ ] 評価計画の立案
- [ ] `executor_node` を実装
  - [ ] ツール呼び出し（search_web）
  - [ ] 評価の実行
- [ ] `reflector_node` を実装
  - [ ] 評価十分性の判定
  - [ ] フィードバック生成
- [ ] `integrator_node` を実装
  - [ ] 結果の統合
  - [ ] 出力形式への変換

### 3.3 ワークフロー構築
- [ ] `should_continue` 関数を実装
- [ ] StateGraphを構築
- [ ] ノードを追加
- [ ] エッジを追加（条件分岐含む）
- [ ] グラフをコンパイル

### 3.4 実行関数
- [ ] `run_evaluator` 関数を実装
- [ ] エラーハンドリングを追加

### 3.5 モジュール初期化
- [ ] `tools/src/agents/evaluator/__init__.py` を作成
- [ ] `run_evaluator` をエクスポート

---

## Phase 4: テスト

### 4.1 スキーマテスト
- [ ] `tools/tests/agents/test_evaluator.py` を作成
- [ ] 入力スキーマのバリデーションテスト
- [ ] 出力スキーマの形式テスト

### 4.2 ノード単体テスト
- [ ] GoalCreatorノードのテスト（モック使用）
- [ ] Plannerノードのテスト（モック使用）
- [ ] Executorノードのテスト（モック使用）
- [ ] Reflectorノードのテスト（モック使用）
- [ ] Integratorノードのテスト（モック使用）

### 4.3 統合テスト
- [ ] エンドツーエンドテスト（記事評価）
- [ ] エンドツーエンドテスト（サービス評価）

---

## Phase 5: 統合

### 5.1 main.py更新
- [ ] `tools/main.py` に評価エージェントを追加
- [ ] CLI引数の追加
- [ ] 実行例の追加

### 5.2 ドキュメント
- [ ] README更新（使用方法）

---

## 完了条件チェックリスト

spec.mdの要件との照合:

- [ ] FR-1.1: 評価目標を生成できる
- [ ] FR-1.2: 評価対象の種類を判別できる
- [ ] FR-1.3: 評価基準を自動策定できる
- [ ] FR-1.4: 不明な場合に質問を生成できる
- [ ] FR-1.5: 回答を反映して基準を更新できる
- [ ] FR-2.1: 評価計画を立案できる
- [ ] FR-2.2: インターネット検索で情報収集できる
- [ ] FR-2.3: 評価を実行できる
- [ ] FR-2.4: 評価の十分性を自己評価できる
- [ ] FR-3.1: 総合スコアを算出できる
- [ ] FR-3.2: 基準別スコアを算出できる
- [ ] FR-3.3: 長所を列挙できる
- [ ] FR-3.4: 短所を列挙できる
- [ ] FR-3.5: 改善点を提案できる
- [ ] NFR-1: 最大5回のリトライで完了する
- [ ] NFR-2: 質問は3つ以下
- [ ] NFR-3: keyword_finderと同様のアーキテクチャ
