---
name: workflow-test-generator
description: マルチエージェントワークフローの統合テストを効率的に作成するためのガイド。モックエージェント作成、ユニットテスト、統合テスト、エラーハンドリングのパターンを提供。
---

# Workflow Test Generator

マルチエージェントオーケストレーターのテストを作成するためのスキル。

## 概要

`AgentOrchestrator` を使用したワークフローのテストを効率的に作成するためのパターン集。ユニットテスト、統合テスト、エラーケースのテスト方法を提供する。

## モックエージェントの作成

### 基本パターン

```python
from unittest.mock import MagicMock

def create_mock_agent(output_data: dict):
    """モックエージェントを作成する"""
    mock_agent = MagicMock()
    mock_output = MagicMock()
    mock_output.model_dump.return_value = output_data
    mock_agent.run.return_value = mock_output
    return mock_agent
```

### 実際のスキーマを使用するパターン

```python
from src.agents.keyword_finder.schemas import (
    KeywordResult,
    KeywordSearchOutput,
)

def create_keyword_finder_mock():
    """KeywordFinderのモックを作成する"""
    mock_agent = MagicMock()
    mock_output = KeywordSearchOutput(
        category="資産形成",
        seed_keywords=["iDeCo"],
        results=[
            KeywordResult(keyword="iDeCo 始め方", relevance_score=0.9),
            KeywordResult(keyword="iDeCo メリット", relevance_score=0.85),
        ],
        summary="キーワードを発見しました",
    )
    mock_agent.run.return_value = mock_output
    return mock_agent
```

### 複数エージェントのセットアップ

```python
def setup_orchestrator_with_mocks():
    """複数のモックエージェントを持つオーケストレーターを作成"""
    orchestrator = AgentOrchestrator()

    # Agent 1
    agent1 = create_mock_agent({"keywords": ["k1", "k2"]})
    orchestrator.register_agent("keyword_finder", agent1)

    # Agent 2
    agent2 = create_mock_agent({"score": 0.85})
    orchestrator.register_agent("evaluator", agent2)

    return orchestrator
```

## pytest Fixture の活用

### 基本的な Fixture

```python
import pytest
from src.pipelines.orchestrator import AgentOrchestrator

@pytest.fixture
def orchestrator():
    """空のオーケストレーターを提供"""
    return AgentOrchestrator()

@pytest.fixture
def mock_agent():
    """基本的なモックエージェントを提供"""
    agent = MagicMock()
    output = MagicMock()
    output.model_dump.return_value = {"result": "success"}
    agent.run.return_value = output
    return agent
```

### パラメータ化 Fixture

```python
@pytest.fixture(params=[
    {"result": "success"},
    {"result": "partial", "errors": []},
    {"result": "empty"},
])
def various_outputs(request):
    """様々な出力パターンを提供"""
    agent = MagicMock()
    output = MagicMock()
    output.model_dump.return_value = request.param
    agent.run.return_value = output
    return agent
```

### Fixture の組み合わせ

```python
@pytest.fixture
def orchestrator_with_agents(orchestrator, mock_agent):
    """エージェント登録済みのオーケストレーターを提供"""
    orchestrator.register_agent("test_agent", mock_agent)
    return orchestrator
```

## ユニットテストのテンプレート

### オーケストレーター基本機能テスト

```python
class TestAgentOrchestrator:
    """AgentOrchestratorのユニットテスト"""

    def test_init_creates_empty_registry(self):
        """初期化時にエージェントレジストリが空である"""
        orchestrator = AgentOrchestrator()
        assert orchestrator.list_agents() == []

    def test_register_agent(self):
        """エージェントを登録できる"""
        orchestrator = AgentOrchestrator()
        mock_agent = MagicMock()

        orchestrator.register_agent("test_agent", mock_agent)

        assert "test_agent" in orchestrator.list_agents()

    def test_get_agent_not_found(self):
        """未登録エージェントの取得でエラー"""
        orchestrator = AgentOrchestrator()

        with pytest.raises(AgentNotFoundError):
            orchestrator.get_agent("nonexistent")
```

### ワークフローステップテスト

```python
class TestWorkflowStep:
    """WorkflowStepのユニットテスト"""

    def test_create_step(self):
        """ステップを作成できる"""
        step = WorkflowStep(
            agent_name="keyword_finder",
            input_mapping={"category": "context.category"},
        )

        assert step.agent_name == "keyword_finder"
        assert step.input_mapping == {"category": "context.category"}

    def test_step_default_output_key(self):
        """デフォルトの出力キーはエージェント名"""
        step = WorkflowStep(agent_name="keyword_finder")

        assert step.output_key == "keyword_finder"
```

### 単一ステップ実行テスト

```python
class TestWorkflowExecution:
    """ワークフロー実行のユニットテスト"""

    def test_run_single_step_workflow(self):
        """単一ステップのワークフローを実行できる"""
        orchestrator = AgentOrchestrator()
        mock_agent = create_mock_agent({"result": "test_result"})
        orchestrator.register_agent("test_agent", mock_agent)

        steps = [WorkflowStep(agent_name="test_agent")]
        result = orchestrator.run_workflow(steps, initial_context={})

        assert isinstance(result, WorkflowResult)
        assert result.success is True
        assert "test_agent" in result.outputs
```

## 統合テストのテンプレート

### 単一エージェント統合テスト

```python
class TestOrchestratorWithKeywordFinder:
    """KeywordFinderAgentとの統合テスト"""

    def test_orchestrator_with_keyword_finder(self):
        """KeywordFinderAgentをオーケストレーターで実行できる"""
        from src.agents.keyword_finder.schemas import (
            KeywordResult,
            KeywordSearchInput,
            KeywordSearchOutput,
        )

        # Setup mock with real schema
        mock_agent = MagicMock()
        mock_output = KeywordSearchOutput(
            category="資産形成",
            seed_keywords=["iDeCo"],
            results=[
                KeywordResult(keyword="iDeCo 始め方", relevance_score=0.9),
            ],
            summary="キーワードを発見",
        )
        mock_agent.run.return_value = mock_output

        # Setup orchestrator
        orchestrator = AgentOrchestrator()
        orchestrator.register_agent("keyword_finder", mock_agent)

        # Run workflow
        steps = [WorkflowStep(agent_name="keyword_finder")]
        initial_context = KeywordSearchInput(
            category="資産形成",
            seed_keywords=["iDeCo"],
        )
        result = orchestrator.run_workflow(steps, initial_context=initial_context)

        # Assert
        assert result.success is True
        assert "keyword_finder" in result.outputs
        assert result.outputs["keyword_finder"]["category"] == "資産形成"
```

### マルチエージェントパイプラインテスト

```python
class TestMultiAgentPipeline:
    """複数エージェントのパイプラインテスト"""

    def test_keyword_finder_to_evaluator_pipeline(self):
        """keyword_finder -> evaluator のパイプラインが動作する"""
        # Mock keyword finder
        mock_finder = MagicMock()
        finder_output = KeywordSearchOutput(
            category="資産形成",
            seed_keywords=["iDeCo"],
            results=[KeywordResult(keyword="iDeCo 始め方", relevance_score=0.9)],
            summary="キーワードを発見",
        )
        mock_finder.run.return_value = finder_output

        # Mock evaluator
        mock_evaluator = MagicMock()
        evaluator_output = EvaluationOutput(
            target_summary="iDeCo 始め方の評価",
            target_type="キーワード",
            overall_score=90,
            criterion_scores=[
                CriterionScore(criterion="関連性", score=90, rationale="良い")
            ],
            strengths=["良いテーマ"],
            weaknesses=[],
            improvements=[],
            evaluation_criteria=["関連性"],
            summary="評価完了",
        )
        mock_evaluator.run.return_value = evaluator_output

        # Setup orchestrator
        orchestrator = AgentOrchestrator()
        orchestrator.register_agent("keyword_finder", mock_finder)
        orchestrator.register_agent("evaluator", mock_evaluator)

        # Define and run workflow
        steps = [
            WorkflowStep(agent_name="keyword_finder"),
            WorkflowStep(agent_name="evaluator"),
        ]
        result = orchestrator.run_workflow(steps, initial_context={})

        # Assert
        assert result.success is True
        assert "keyword_finder" in result.outputs
        assert "evaluator" in result.outputs
        mock_finder.run.assert_called_once()
        mock_evaluator.run.assert_called_once()
```

### コンテキストフロー検証テスト

```python
class TestWorkflowContextFlow:
    """ワークフローのコンテキストフローテスト"""

    def test_context_accumulates_through_workflow(self):
        """ワークフローを通じてコンテキストが蓄積される"""
        orchestrator = AgentOrchestrator()

        # Create mock agents
        agent1 = create_mock_agent({"step1_data": "value1"})
        agent2 = create_mock_agent({"step2_data": "value2"})
        agent3 = create_mock_agent({"step3_data": "value3"})

        orchestrator.register_agent("step1", agent1)
        orchestrator.register_agent("step2", agent2)
        orchestrator.register_agent("step3", agent3)

        steps = [
            WorkflowStep(agent_name="step1"),
            WorkflowStep(agent_name="step2"),
            WorkflowStep(agent_name="step3"),
        ]

        result = orchestrator.run_workflow(
            steps, initial_context={"initial": "context"}
        )

        # Verify context accumulated
        assert result.context["initial"] == "context"
        assert result.context["step1"]["step1_data"] == "value1"
        assert result.context["step2"]["step2_data"] == "value2"
        assert result.context["step3"]["step3_data"] == "value3"

    def test_later_steps_can_access_earlier_outputs(self):
        """後のステップが前のステップの出力にアクセスできる"""
        orchestrator = AgentOrchestrator()

        agent1 = create_mock_agent({"keywords": ["k1", "k2"]})
        agent2 = create_mock_agent({"processed": True})

        orchestrator.register_agent("finder", agent1)
        orchestrator.register_agent("processor", agent2)

        steps = [
            WorkflowStep(agent_name="finder"),
            WorkflowStep(
                agent_name="processor",
                input_mapping={"keywords": "finder.keywords"},
            ),
        ]

        result = orchestrator.run_workflow(steps, initial_context={})

        # Verify processor received the keywords
        processor_call_args = agent2.run.call_args
        input_received = processor_call_args[0][0]
        assert input_received.get("keywords") == ["k1", "k2"]
```

## エラーケーステストのテンプレート

### エージェント未登録エラー

```python
class TestErrorHandling:
    """エラーハンドリングのテスト"""

    def test_workflow_with_unregistered_agent(self):
        """未登録エージェントでエラー"""
        orchestrator = AgentOrchestrator()

        steps = [WorkflowStep(agent_name="nonexistent")]

        with pytest.raises(AgentNotFoundError):
            orchestrator.run_workflow(steps, initial_context={})
```

### エージェント実行エラー

```python
    def test_agent_execution_error(self):
        """エージェント実行エラーが伝播する"""
        orchestrator = AgentOrchestrator()

        mock_agent = MagicMock()
        mock_agent.run.side_effect = Exception("Agent failed")

        orchestrator.register_agent("failing_agent", mock_agent)

        steps = [WorkflowStep(agent_name="failing_agent")]

        with pytest.raises(OrchestratorError) as exc_info:
            orchestrator.run_workflow(steps, initial_context={})

        assert "failing_agent" in str(exc_info.value)
```

### 部分的失敗のテスト

```python
    def test_workflow_result_on_partial_failure(self):
        """部分的失敗時のワークフロー結果"""
        orchestrator = AgentOrchestrator()

        # First agent succeeds
        agent1 = create_mock_agent({"result": "success"})
        orchestrator.register_agent("agent1", agent1)

        # Second agent fails
        agent2 = MagicMock()
        agent2.run.side_effect = Exception("Second agent failed")
        orchestrator.register_agent("agent2", agent2)

        steps = [
            WorkflowStep(agent_name="agent1"),
            WorkflowStep(agent_name="agent2"),
        ]

        with pytest.raises(OrchestratorError) as exc_info:
            orchestrator.run_workflow(steps, initial_context={})

        # Error contains the failing agent name
        assert "agent2" in str(exc_info.value)
```

## 実際のユースケーステスト

### コンテンツ作成ワークフロー

```python
class TestRealWorldScenarios:
    """実際のユースケースシナリオテスト"""

    def test_content_creation_workflow(self):
        """コンテンツ作成ワークフロー（キーワード調査→評価→記事作成）"""
        orchestrator = AgentOrchestrator()

        # Step 1: Keyword Finder
        finder = create_keyword_finder_mock()
        orchestrator.register_agent("keyword_finder", finder)

        # Step 2: Evaluator
        evaluator = create_evaluator_mock()
        orchestrator.register_agent("evaluator", evaluator)

        # Step 3: Writer
        writer = create_writer_mock()
        orchestrator.register_agent("writer", writer)

        # Execute workflow
        steps = [
            WorkflowStep(agent_name="keyword_finder"),
            WorkflowStep(agent_name="evaluator"),
            WorkflowStep(agent_name="writer"),
        ]

        result = orchestrator.run_workflow(
            steps,
            initial_context={"category": "資産形成", "topic": "投資信託"}
        )

        # Verify complete workflow execution
        assert result.success is True
        assert result.execution_time >= 0
        assert len(result.outputs) == 3

        # Verify all outputs present
        assert "keyword_finder" in result.outputs
        assert "evaluator" in result.outputs
        assert "writer" in result.outputs
```

## テストファイル構成

```
tools/tests/
├── pipelines/
│   ├── test_orchestrator.py           # ユニットテスト
│   └── test_orchestrator_integration.py # 統合テスト
├── agents/
│   ├── test_keyword_finder.py
│   ├── test_evaluator.py
│   └── test_writer.py
└── conftest.py                         # 共通Fixture
```

## 共通 conftest.py の例

```python
# tools/tests/conftest.py
import pytest
from unittest.mock import MagicMock

from src.pipelines.orchestrator import AgentOrchestrator


@pytest.fixture
def orchestrator():
    """空のオーケストレーターを提供"""
    return AgentOrchestrator()


@pytest.fixture
def mock_output():
    """基本的なモック出力を提供"""
    output = MagicMock()
    output.model_dump.return_value = {"result": "success"}
    return output


@pytest.fixture
def mock_agent(mock_output):
    """基本的なモックエージェントを提供"""
    agent = MagicMock()
    agent.run.return_value = mock_output
    return agent


def create_mock_agent(output_data: dict):
    """ヘルパー: 指定した出力を返すモックエージェントを作成"""
    agent = MagicMock()
    output = MagicMock()
    output.model_dump.return_value = output_data
    agent.run.return_value = output
    return agent
```

## チェックリスト

### テスト作成時

- [ ] モックエージェントが正しく設定されているか
- [ ] 実際のスキーマを使用しているか（統合テストの場合）
- [ ] コンテキストの受け渡しが検証されているか
- [ ] エラーケースがカバーされているか
- [ ] Fixtureを活用して重複を排除しているか

### テスト実行時

```bash
# 全テスト実行
uv run pytest tests/ -v

# 特定のテストファイル
uv run pytest tests/pipelines/test_orchestrator.py -v

# 特定のテストクラス
uv run pytest tests/pipelines/test_orchestrator.py::TestErrorHandling -v

# カバレッジ付き
uv run pytest tests/ --cov=src/pipelines --cov-report=html
```

## 参考実装

- `tools/tests/pipelines/test_orchestrator.py` - ユニットテスト例
- `tools/tests/pipelines/test_orchestrator_integration.py` - 統合テスト例
- `tools/tests/agents/test_writer.py` - エージェントテスト例
