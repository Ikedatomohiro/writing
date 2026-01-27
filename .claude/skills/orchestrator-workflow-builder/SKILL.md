# Orchestrator Workflow Builder

複数エージェントを連携させるワークフローを定義・実行するためのスキル。

## 概要

AgentOrchestrator は、複数のエージェントを順次実行し、コンテキストを受け渡すためのフレームワークである。

```
[入力] → [Agent A] → [Agent B] → [Agent C] → [出力]
              ↓           ↓           ↓
         context に蓄積されていく
```

## 基本的な使い方

### 1. エージェントの登録

```python
from src.pipelines.orchestrator import AgentOrchestrator, WorkflowStep

# オーケストレーター初期化
orchestrator = AgentOrchestrator()

# エージェントを登録（名前とインスタンス）
orchestrator.register_agent("keyword_finder", KeywordFinderAgent())
orchestrator.register_agent("evaluator", EvaluatorAgent())
orchestrator.register_agent("writer", WriterAgent())

# 登録済みエージェントの確認
print(orchestrator.list_agents())  # ['keyword_finder', 'evaluator', 'writer']
```

**注意点**:
- エージェントは `run(input)` メソッドを持つ必要がある
- 名前は一意である必要がある
- 登録順は実行順とは関係ない

### 2. WorkflowStep の定義

```python
from src.pipelines.orchestrator import WorkflowStep

# 基本的なステップ
step1 = WorkflowStep(agent_name="keyword_finder")

# 入力マッピング付きステップ
step2 = WorkflowStep(
    agent_name="evaluator",
    input_mapping={"keywords": "keyword_finder.results"},
)

# カスタム出力キー付きステップ
step3 = WorkflowStep(
    agent_name="writer",
    input_mapping={"topic": "context.topic"},
    output_key="article",  # デフォルトは agent_name
)
```

#### WorkflowStep のパラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `agent_name` | str | 実行するエージェントの名前（必須） |
| `input_mapping` | dict[str, str] | 入力フィールドへのマッピング |
| `output_key` | str \| None | 出力を格納するキー（デフォルト: agent_name） |

### 3. ワークフローの実行

```python
# ステップを定義
steps = [
    WorkflowStep(agent_name="keyword_finder"),
    WorkflowStep(
        agent_name="evaluator",
        input_mapping={"keywords": "keyword_finder.results"},
    ),
    WorkflowStep(
        agent_name="writer",
        input_mapping={
            "keywords": "keyword_finder.results",
            "evaluation": "evaluator.overall_score",
        },
    ),
]

# 初期コンテキストを設定
initial_context = {
    "category": "資産形成",
    "topic": "投資信託",
}

# ワークフロー実行
result = orchestrator.run_workflow(steps, initial_context=initial_context)

# 結果の確認
if result.success:
    print(f"実行時間: {result.execution_time:.2f}秒")
    print(f"出力: {result.outputs}")
else:
    print(f"エラー: {result.error}")
```

## 入力マッピング

### パス記法

入力マッピングはドット記法でコンテキスト内のデータにアクセスする。

```python
input_mapping = {
    # 前のエージェントの出力にアクセス
    "keywords": "keyword_finder.results",

    # ネストしたデータにアクセス
    "score": "evaluator.criterion_scores.0.score",

    # 初期コンテキストにアクセス（context. プレフィックス）
    "category": "context.category",
}
```

### マッピングなしの場合

`input_mapping` を指定しない場合、現在のコンテキスト全体がエージェントに渡される。

```python
# コンテキスト全体を渡す
WorkflowStep(agent_name="simple_agent")

# 特定のフィールドのみ渡す
WorkflowStep(
    agent_name="specific_agent",
    input_mapping={"data": "previous_agent.output"},
)
```

## コンテキストの流れ

```python
# 初期状態
context = {"category": "資産形成"}

# Step 1 実行後
context = {
    "category": "資産形成",
    "keyword_finder": {"results": [...], "summary": "..."},
}

# Step 2 実行後
context = {
    "category": "資産形成",
    "keyword_finder": {"results": [...], "summary": "..."},
    "evaluator": {"overall_score": 85, "strengths": [...]},
}

# Step 3 実行後
context = {
    "category": "資産形成",
    "keyword_finder": {"results": [...], "summary": "..."},
    "evaluator": {"overall_score": 85, "strengths": [...]},
    "writer": {"title": "...", "content": "..."},
}
```

## WorkflowResult

ワークフロー実行の結果は `WorkflowResult` オブジェクトで返される。

```python
@dataclass
class WorkflowResult:
    success: bool          # 成功したかどうか
    outputs: dict[str, Any]  # 各エージェントの出力
    context: dict[str, Any]  # 最終コンテキスト
    execution_time: float    # 実行時間（秒）
    error: str | None        # エラーメッセージ（失敗時）
```

### 結果の活用

```python
result = orchestrator.run_workflow(steps, initial_context)

# 成功時
if result.success:
    # 特定のエージェントの出力を取得
    keywords = result.outputs["keyword_finder"]["results"]
    article = result.outputs["writer"]["content"]

    # 最終コンテキストから取得
    final_score = result.context["evaluator"]["overall_score"]

    print(f"処理時間: {result.execution_time:.2f}秒")

# 失敗時
else:
    print(f"ワークフロー失敗: {result.error}")
```

## エラーハンドリング

### 例外の種類

```python
from src.pipelines.orchestrator import (
    OrchestratorError,
    AgentNotFoundError,
)

try:
    result = orchestrator.run_workflow(steps, initial_context)
except AgentNotFoundError as e:
    # 未登録のエージェントが指定された
    print(f"エージェントが見つかりません: {e}")
except OrchestratorError as e:
    # エージェント実行中のエラー
    print(f"実行エラー: {e}")
```

### ベストプラクティス

1. **事前バリデーション**: ワークフロー実行前にすべてのエージェントが登録されているか確認される

```python
# run_workflow 内で自動的に検証される
for step in steps:
    if step.agent_name not in self._agents:
        raise AgentNotFoundError(...)
```

2. **エージェントの出力検証**: Pydantic モデルを使用して出力を検証

```python
# エージェントの出力が model_dump() を持つ場合、自動的に dict 変換される
if hasattr(output, "model_dump"):
    output_dict = output.model_dump()
```

3. **ログ出力**: 各ステップの開始・終了をログに記録

```python
import logging

logger = logging.getLogger(__name__)

# ワークフロー実行前
logger.info(f"ワークフロー開始: {len(steps)}ステップ")

# 各ステップ
logger.info(f"ステップ実行: {step.agent_name}")
```

## 実践的なワークフロー例

### コンテンツ作成パイプライン

```python
from src.agents.keyword_finder import KeywordFinderAgent
from src.agents.evaluator import EvaluatorAgent
from src.agents.writer import WriterAgent
from src.pipelines.orchestrator import AgentOrchestrator, WorkflowStep

def create_content_workflow():
    """コンテンツ作成ワークフローを構築"""
    orchestrator = AgentOrchestrator()

    # エージェント登録
    orchestrator.register_agent("keyword_finder", KeywordFinderAgent())
    orchestrator.register_agent("evaluator", EvaluatorAgent())
    orchestrator.register_agent("writer", WriterAgent())

    # ワークフロー定義
    steps = [
        # Step 1: キーワード調査
        WorkflowStep(agent_name="keyword_finder"),

        # Step 2: キーワード評価
        WorkflowStep(
            agent_name="evaluator",
            input_mapping={
                "target": "keyword_finder.results.0.keyword",
                "evaluation_request": "context.evaluation_criteria",
            },
        ),

        # Step 3: 記事作成
        WorkflowStep(
            agent_name="writer",
            input_mapping={
                "topic": "context.topic",
                "keywords": "keyword_finder.results",
            },
        ),
    ]

    return orchestrator, steps


def run_content_creation(category: str, topic: str):
    """コンテンツ作成を実行"""
    orchestrator, steps = create_content_workflow()

    initial_context = {
        "category": category,
        "topic": topic,
        "evaluation_criteria": "SEO効果と読者価値を評価してください",
    }

    result = orchestrator.run_workflow(steps, initial_context)

    if result.success:
        return {
            "article": result.outputs["writer"],
            "keywords": result.outputs["keyword_finder"]["results"],
            "evaluation": result.outputs["evaluator"]["overall_score"],
        }
    else:
        raise RuntimeError(f"コンテンツ作成失敗: {result.error}")


# 使用例
if __name__ == "__main__":
    content = run_content_creation(
        category="資産形成",
        topic="新NISAの始め方",
    )
    print(f"記事タイトル: {content['article']['title']}")
```

## トラブルシューティング

### よくあるエラー

| エラー | 原因 | 解決策 |
|--------|------|--------|
| `AgentNotFoundError` | 未登録のエージェントを参照 | `register_agent()` で登録 |
| `KeyError` in input_mapping | パスが存在しない | パス記法を確認 |
| `AttributeError` | エージェントに `run()` がない | エージェント実装を確認 |

### デバッグのヒント

```python
# 登録済みエージェントを確認
print(orchestrator.list_agents())

# 各ステップの出力を確認
result = orchestrator.run_workflow(steps, initial_context)
for agent_name, output in result.outputs.items():
    print(f"{agent_name}: {output}")

# コンテキストの状態を確認
print(result.context)
```

## 関連ファイル

- `tools/src/pipelines/orchestrator.py` - オーケストレーター実装
- `tools/src/core/orchestrator/schemas.py` - スキーマ定義
- `tools/tests/pipelines/test_orchestrator_integration.py` - 統合テスト例
