---
name: langgraph-node-pattern
description: BaseNode継承でLangGraphノードを実装する。スキーマ→プロンプト→ノード→テストの順序で開発する際に使用する。
---

# LangGraph Node Pattern

BaseNode を継承して LangGraph ノードを実装するパターン。

## 概要

このスキルは、`src/core/nodes/BaseNode` を継承してエージェントのノードを実装する際の標準パターンを提供する。

## ディレクトリ構造

```
agents/<agent_name>/
├── __init__.py
├── agent.py           # エージェント定義（BaseAgent継承）
├── nodes.py           # ノード実装（BaseNode継承）
├── schemas/
│   ├── __init__.py
│   ├── state.py       # AgentState定義
│   └── <feature>.py   # 機能固有スキーマ
└── prompts/
    ├── __init__.py
    └── <node_name>.py # ノード用プロンプト
```

## 実装手順

### Step 1: スキーマ定義

```python
# schemas/<feature>.py
from pydantic import BaseModel, Field

class MyNodeOutput(BaseModel):
    """ノードの出力スキーマ"""

    result: str = Field(description="処理結果")
    items: list[str] = Field(description="アイテムリスト")
    is_valid: bool = Field(description="有効性フラグ")
```

### Step 2: プロンプト定義

```python
# prompts/<node_name>.py
from src.core.nodes import PromptConfig

MY_NODE_PROMPT_CONFIG = PromptConfig(
    system_prompt="""あなたは専門のアシスタントです。
以下の条件に従って処理を行ってください：
- 条件1
- 条件2
""",
    user_prompt_template="""
## 入力情報
- トピック: {topic}
- キーワード: {keywords}

## タスク
上記の情報を基に処理を行い、結果を出力してください。
"""
)
```

### Step 3: ノード実装

```python
# nodes.py
from typing import Any
from src.core.nodes import BaseNode
from src.agents.<agent_name>.schemas import AgentState, MyNodeOutput
from src.agents.<agent_name>.prompts import MY_NODE_PROMPT_CONFIG
from src.common import get_logger

logger = get_logger(__name__)


class MyNode(BaseNode[AgentState, MyNodeOutput]):
    """処理ノード"""

    def __init__(self):
        super().__init__(
            prompt_config=MY_NODE_PROMPT_CONFIG,
            output_schema=MyNodeOutput,
        )

    def extract_prompt_variables(self, state: AgentState) -> dict[str, Any]:
        """状態からプロンプト変数を抽出"""
        input_data = state["input"]
        return {
            "topic": input_data.topic,
            "keywords": ", ".join(input_data.keywords),
        }

    def update_state(self, state: AgentState, output: MyNodeOutput) -> dict[str, Any]:
        """出力で状態を更新"""
        logger.info(f"処理完了: {output.result}")
        return {"my_output": output}

    def should_skip(self, state: AgentState) -> bool:
        """スキップ条件（オプション）"""
        return state.get("my_output") is not None

    def __call__(self, state: AgentState) -> dict[str, Any]:
        """ノード実行（ログ追加のためオーバーライド）"""
        logger.info("処理を開始")
        return super().__call__(state)
```

### Step 4: State拡張

```python
# schemas/state.py
from typing import TypedDict
from src.agents.<agent_name>.schemas import MyNodeOutput

class AgentState(TypedDict, total=False):
    input: MyInput
    my_output: MyNodeOutput | None  # 新しいフィールド追加
    # ... 他のフィールド
```

### Step 5: テスト作成

```python
# tests/agents/<agent_name>/nodes/test_my_node.py
import pytest
from unittest.mock import MagicMock, patch
from src.agents.<agent_name>.nodes import MyNode
from src.agents.<agent_name>.schemas import AgentState, MyInput, MyNodeOutput


class TestMyNode:
    """MyNode のテスト"""

    @pytest.fixture
    def node(self):
        return MyNode()

    @pytest.fixture
    def mock_state(self) -> AgentState:
        return AgentState(
            input=MyInput(
                topic="テストトピック",
                keywords=["キーワード1", "キーワード2"],
            ),
            my_output=None,
        )

    def test_extract_prompt_variables(self, node, mock_state):
        """プロンプト変数抽出のテスト"""
        variables = node.extract_prompt_variables(mock_state)

        assert variables["topic"] == "テストトピック"
        assert "キーワード1" in variables["keywords"]

    def test_update_state(self, node, mock_state):
        """状態更新のテスト"""
        output = MyNodeOutput(
            result="成功",
            items=["item1", "item2"],
            is_valid=True,
        )

        updates = node.update_state(mock_state, output)

        assert "my_output" in updates
        assert updates["my_output"].result == "成功"

    def test_should_skip_when_output_exists(self, node, mock_state):
        """出力が存在する場合スキップするテスト"""
        mock_state["my_output"] = MyNodeOutput(
            result="既存",
            items=[],
            is_valid=True,
        )

        assert node.should_skip(mock_state) is True

    def test_should_not_skip_when_output_none(self, node, mock_state):
        """出力がNoneの場合スキップしないテスト"""
        assert node.should_skip(mock_state) is False

    @patch("src.models.get_structured_model")
    def test_call_invokes_model(self, mock_get_model, node, mock_state):
        """__call__がモデルを呼び出すテスト"""
        mock_model = MagicMock()
        mock_model.invoke.return_value = MyNodeOutput(
            result="テスト結果",
            items=["a", "b"],
            is_valid=True,
        )
        mock_get_model.return_value = mock_model

        result = node(mock_state)

        assert mock_model.invoke.called
        assert "my_output" in result
```

## チェックリスト

実装時の確認事項:

- [ ] スキーマに適切な `Field(description=...)` を設定しているか
- [ ] プロンプトが明確で具体的か
- [ ] `extract_prompt_variables` が必要な変数を全て抽出しているか
- [ ] `update_state` が正しいキーで状態を更新しているか
- [ ] `should_skip` で適切なスキップ条件を設定しているか（必要な場合）
- [ ] ロガーでデバッグ情報を出力しているか
- [ ] テストで主要なケースをカバーしているか

## 参考実装

- `src/agents/keyword_finder/nodes.py` - PlannerNode, ExecutorNode, ReflectorNode
- `src/agents/evaluator/nodes.py` - GoalCreatorNode
- `src/agents/writer/nodes.py` - AngleProposalNode, AngleSelectionNode
