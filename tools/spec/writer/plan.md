# Writer Agent 実装計画

## 実装ステップ

### Step 1: スキーマ定義
1. `schemas/input.py` - WriterInput定義
2. `schemas/output.py` - WriterOutput, Section, ArticlePlan, ReflectionResult定義
3. `schemas/state.py` - AgentState定義
4. `schemas/__init__.py` - エクスポート

### Step 2: プロンプト定義
1. `prompts/planner.py` - 記事構成計画用プロンプト
2. `prompts/executor.py` - セクション執筆用プロンプト
3. `prompts/reflector.py` - 品質チェック用プロンプト
4. `prompts/integrator.py` - 結果統合用プロンプト
5. `prompts/__init__.py` - エクスポート

### Step 3: ノード実装
1. `nodes.py` - PlannerNode, ExecutorNode, ReflectorNode, IntegratorNode
   - すべてBaseNode継承（外部ツール不要のため）

### Step 4: エージェント実装
1. `agent.py` - WriterAgent（BaseAgent継承）
2. 後方互換関数: `create_writer_graph()`, `run_writer()`

### Step 5: エクスポート設定
1. `__init__.py` - 公開APIのエクスポート
2. `src/agents/__init__.py` への追加

## 影響を受けるファイル

### 新規作成
- `src/agents/writer/schemas/input.py`
- `src/agents/writer/schemas/output.py`
- `src/agents/writer/schemas/state.py`
- `src/agents/writer/schemas/__init__.py`
- `src/agents/writer/prompts/planner.py`
- `src/agents/writer/prompts/executor.py`
- `src/agents/writer/prompts/reflector.py`
- `src/agents/writer/prompts/integrator.py`
- `src/agents/writer/prompts/__init__.py`
- `src/agents/writer/nodes.py`
- `src/agents/writer/agent.py`
- `tests/agents/test_writer.py`

### 修正
- `src/agents/writer/__init__.py` - 既存の空ファイルを更新
- `src/agents/__init__.py` - writerをエクスポートに追加（必要に応じて）

## 依存関係

- `src/core/agents` - BaseAgent
- `src/core/nodes` - BaseNode, PromptConfig
- `src/core/schemas` - BaseReflection
- `src/core/utils` - RetryConfig, create_should_continue
- `src/models` - get_structured_model
- `src/common` - get_logger, settings

## テスト計画

### ユニットテスト
1. スキーマのバリデーションテスト
2. 各ノードの単体テスト（モック使用）
3. エージェントのグラフ構築テスト
4. `run_writer()`の統合テスト

### テストパターン
- keyword_finder/evaluatorのテストパターンを踏襲
- pytest + モックを使用

## リスクと対策

| リスク | 対策 |
|--------|------|
| ExecutorNodeが複雑になる | 1セクションずつ生成し、状態で蓄積 |
| 生成品質のばらつき | Reflectorで品質チェック、リトライ |
| プロンプトの調整が必要 | 最小限で動作確認後、改善 |
