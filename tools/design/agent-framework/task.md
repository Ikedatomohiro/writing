# Agent Framework タスクリスト

## 現在のフェーズ: Phase 1

---

## Phase 1: 最小限の共通基盤

### 1.1 ディレクトリ・ファイル作成

- [ ] `tools/src/core/__init__.py` 作成
- [ ] `tools/src/core/base_state.py` 作成
- [ ] `tools/src/core/base_node.py` 作成

### 1.2 base_state.py 実装

- [ ] `BaseReflection` スキーマ定義
  - `is_sufficient: bool`
  - `feedback: str`
- [ ] `BaseToolResult` スキーマ定義
  - `tool_name: str`
  - `query: str`
  - `results: list[Any]`

### 1.3 base_node.py 実装

- [ ] `BaseNode` 抽象基底クラス
  - [ ] `__init__(system_prompt, user_prompt_template, output_schema)`
  - [ ] `extract_variables(state)` 抽象メソッド
  - [ ] `update_state(result, state)` 抽象メソッド
  - [ ] `__call__(state)` テンプレートメソッド
- [ ] `PlannerNode(BaseNode)` 実装
- [ ] `ReflectorNode(BaseNode)` 実装
- [ ] `IntegratorNode(BaseNode)` 実装
- [ ] `should_continue()` 共通関数

### 1.4 テスト

- [ ] `tools/tests/core/test_base_node.py` 作成
- [ ] `tools/tests/core/test_base_state.py` 作成
- [ ] 全テストがパスすることを確認

### 1.5 完了確認

- [ ] `uv run ruff check .` パス
- [ ] `uv run ruff format .` 実行
- [ ] `uv run pytest` パス

---

## Phase 2: keyword_finder 移行

### 2.1 ノード実装

- [ ] `tools/src/agents/keyword_finder/nodes.py` 作成
  - [ ] `KeywordPlannerNode(PlannerNode)` 実装
  - [ ] `KeywordExecutorNode` 実装（ツール実行は固有ロジック）
  - [ ] `KeywordReflectorNode(ReflectorNode)` 実装
  - [ ] `KeywordIntegratorNode(IntegratorNode)` 実装

### 2.2 プロンプト整理

- [ ] プロンプト定義を `prompts/` に維持
- [ ] ノード設定を集約

### 2.3 agent.py 更新

- [ ] 新ノードを使用するよう更新
- [ ] グラフ構築ロジックを簡素化

### 2.4 テスト

- [ ] 既存テストがパスすることを確認
- [ ] 動作確認（手動テスト）

---

## Phase 3: evaluator 移行

### 3.1 ノード実装

- [ ] `tools/src/agents/evaluator/nodes.py` 作成
  - [ ] `GoalCreatorNode` 実装
  - [ ] `EvaluatorPlannerNode(PlannerNode)` 実装
  - [ ] `EvaluatorExecutorNode` 実装
  - [ ] `EvaluatorReflectorNode(ReflectorNode)` 実装
  - [ ] `EvaluatorIntegratorNode(IntegratorNode)` 実装

### 3.2 agent.py 更新

- [ ] 新ノードを使用するよう更新

### 3.3 テスト

- [ ] 既存テストがパスすることを確認
- [ ] 動作確認（手動テスト）

---

## Phase 4: BaseAgent 実装

### 4.1 base_agent.py 作成

- [ ] `tools/src/core/base_agent.py` 作成
- [ ] `BaseAgent` 抽象基底クラス
  - [ ] `get_state_schema()` 抽象メソッド
  - [ ] `get_nodes()` 抽象メソッド
  - [ ] `get_initial_state(input_data)` 抽象メソッド
  - [ ] `get_edges()` デフォルト実装
  - [ ] `should_continue(state)` デフォルト実装
  - [ ] `build_graph()` 実装
  - [ ] `run(input_data)` 実装

### 4.2 エージェント更新

- [ ] `KeywordFinderAgent(BaseAgent)` に更新
- [ ] `EvaluatorAgent(BaseAgent)` に更新

### 4.3 テスト

- [ ] 単体テスト作成
- [ ] 既存テストがパスすることを確認

---

## Phase 5: 新規エージェント作成（検証）

### 5.1 writer エージェント設計

- [ ] `tools/design/writer/spec.md` 作成
- [ ] プロンプト設計
- [ ] スキーマ設計

### 5.2 実装

- [ ] `tools/src/agents/writer/` ディレクトリ作成
- [ ] ノード実装
- [ ] エージェント実装

### 5.3 検証

- [ ] コピペなしで実装できたか確認
- [ ] 共通フレームワークの改善点を記録

---

## Phase 6: オーケストレーター（将来）

### 6.1 設計

- [ ] オーケストレーター仕様書作成
- [ ] エージェント間連携の設計

### 6.2 実装

- [ ] `tools/src/core/orchestrator.py` 作成
- [ ] タスク分解ロジック
- [ ] エージェントルーティング
- [ ] 結果統合

---

## spec.md との照合チェック

- [x] FR-1: ノード基底クラス → Phase 1 でカバー
- [x] FR-2: 共通スキーマ → Phase 1 でカバー
- [x] FR-3: 共通ロジック → Phase 1 でカバー
- [x] FR-4: エージェント基底クラス → Phase 4 でカバー
- [x] FR-5: オーケストレーター → Phase 6 でカバー
- [x] NFR-1: 後方互換性 → Phase 2, 3 のテストでカバー
- [x] NFR-2: テスタビリティ → 各フェーズでテスト作成
- [x] NFR-3: 拡張性 → Phase 5 で検証
