---
name: langgraph-flow-extender
description: LangGraphエージェントに新しいノードを追加してフローを拡張する。entry_point変更、エッジ追加、state拡張を行う際に使用する。
---

# LangGraph Flow Extender

既存の LangGraph エージェントに新しいノードを追加してフローを拡張するパターン。

## 概要

このスキルは、BaseAgent を継承したエージェントに新しいノードを追加し、グラフフローを拡張する方法を提供する。

## フロー拡張の種類

### 1. 先頭にノードを追加

```
【変更前】
Input → Plan → Execute → Reflect → Integrate → Output

【変更後】
Input → NewNode → Plan → Execute → Reflect → Integrate → Output
```

### 2. 中間にノードを追加

```
【変更前】
Input → Plan → Execute → Reflect → Integrate → Output

【変更後】
Input → Plan → NewNode → Execute → Reflect → Integrate → Output
```

### 3. 条件分岐を追加

```
【変更前】
Reflect → Integrate

【変更後】
Reflect → [条件] → Execute（リトライ）
              ↓
          Integrate（完了）
```

## 実装手順

### Step 1: State拡張

新しいノードが必要とするフィールドを State に追加:

```python
# schemas/state.py
from typing import TypedDict

class AgentState(TypedDict, total=False):
    input: MyInput
    # 既存フィールド
    plan: ArticlePlan | None
    sections: list[Section]
    reflection: ReflectionResult | None
    retry_count: int
    output: WriterOutput | None

    # 新しいフィールドを追加
    new_feature: NewFeatureOutput | None
```

### Step 2: ノード作成

`langgraph-node-pattern` スキルに従ってノードを作成:

```python
# nodes.py
class NewFeatureNode(BaseNode[AgentState, NewFeatureOutput]):
    """新機能ノード"""
    # ... 実装
```

### Step 3: create_nodes() 更新

```python
# agent.py
class MyAgent(BaseAgent[AgentState, MyInput, MyOutput]):

    def create_nodes(self) -> dict[str, Any]:
        return {
            "new_feature": NewFeatureNode(),  # 新しいノード追加
            "plan": PlannerNode(),
            "execute": ExecutorNode(),
            "reflect": ReflectorNode(),
            "integrate": IntegratorNode(),
        }
```

### Step 4: define_graph_edges() 更新

#### パターンA: 先頭にノード追加

```python
def define_graph_edges(self, graph: StateGraph[AgentState]) -> None:
    # エントリーポイントを新ノードに変更
    graph.set_entry_point("new_feature")

    # 新ノード → 既存の先頭ノード
    graph.add_edge("new_feature", "plan")

    # 既存のエッジはそのまま
    graph.add_edge("plan", "execute")
    graph.add_edge("execute", "reflect")
    graph.add_conditional_edges(
        "reflect",
        create_should_continue(self._retry_config),
        {"execute": "execute", "integrate": "integrate"},
    )
    graph.add_edge("integrate", END)
```

#### パターンB: 中間にノード追加

```python
def define_graph_edges(self, graph: StateGraph[AgentState]) -> None:
    graph.set_entry_point("plan")

    # plan → 新ノード（変更）
    graph.add_edge("plan", "new_feature")

    # 新ノード → execute（新規）
    graph.add_edge("new_feature", "execute")

    # 以降は既存のまま
    graph.add_edge("execute", "reflect")
    # ...
```

#### パターンC: 条件分岐追加

```python
def define_graph_edges(self, graph: StateGraph[AgentState]) -> None:
    graph.set_entry_point("plan")
    graph.add_edge("plan", "execute")
    graph.add_edge("execute", "reflect")

    # 条件分岐を追加
    graph.add_conditional_edges(
        "reflect",
        self._determine_next_step,
        {
            "retry": "execute",
            "new_process": "new_feature",
            "finish": "integrate",
        },
    )

    graph.add_edge("new_feature", "integrate")
    graph.add_edge("integrate", END)

def _determine_next_step(self, state: AgentState) -> str:
    """次のステップを決定"""
    reflection = state.get("reflection")
    if reflection and reflection.needs_new_feature:
        return "new_process"
    if reflection and reflection.is_sufficient:
        return "finish"
    return "retry"
```

### Step 5: create_initial_state() 更新

```python
def create_initial_state(self, input_data: MyInput) -> AgentState:
    return AgentState(
        input=input_data,
        new_feature=None,  # 新しいフィールドの初期値
        plan=None,
        sections=[],
        reflection=None,
        retry_count=0,
        output=None,
    )
```

## 実装例: 切り口提案ノードの追加

### 変更前

```
Input → Plan → Execute → Reflect → Integrate → Output
```

### 変更後

```
Input → AngleProposal → AngleSelect → Plan → Execute → Reflect → Integrate → Output
```

### 実装コード

```python
# agent.py
class WriterAgent(BaseAgent[AgentState, WriterInput, WriterOutput]):

    def create_nodes(self) -> dict[str, Any]:
        return {
            "angle_proposal": AngleProposalNode(),    # 追加
            "angle_select": AngleSelectionNode(),    # 追加
            "plan": PlannerNode(),
            "execute": ExecutorNode(),
            "reflect": ReflectorNode(),
            "integrate": IntegratorNode(),
        }

    def define_graph_edges(self, graph: StateGraph[AgentState]) -> None:
        # 新しいエントリーポイント
        graph.set_entry_point("angle_proposal")

        # 新しいフロー
        graph.add_edge("angle_proposal", "angle_select")
        graph.add_edge("angle_select", "plan")

        # 既存フロー
        graph.add_edge("plan", "execute")
        graph.add_edge("execute", "reflect")
        graph.add_conditional_edges(
            "reflect",
            create_should_continue(self._retry_config),
            {"execute": "execute", "integrate": "integrate"},
        )
        graph.add_edge("integrate", END)
```

## テスト

```python
# tests/agents/<agent_name>/test_agent.py
class TestAgentFlow:
    """エージェントフローのテスト"""

    def test_graph_has_new_node(self):
        """新ノードがグラフに含まれているか"""
        agent = MyAgent()
        nodes = agent.create_nodes()

        assert "new_feature" in nodes
        assert "plan" in nodes
        assert "execute" in nodes

    def test_entry_point_is_new_node(self):
        """エントリーポイントが新ノードか"""
        agent = MyAgent()
        graph = agent.build_graph()

        # グラフの構造を確認
        # （実際のテスト方法はLangGraphのバージョンによる）
```

## チェックリスト

実装時の確認事項:

- [ ] State に新しいフィールドを追加したか
- [ ] `create_nodes()` に新ノードを追加したか
- [ ] `define_graph_edges()` でエッジを正しく設定したか
- [ ] `set_entry_point()` を適切に変更したか（先頭追加の場合）
- [ ] `create_initial_state()` で新フィールドを初期化したか
- [ ] 条件分岐の場合、全ての分岐先を定義したか
- [ ] 既存のテストが通ることを確認したか
- [ ] 新しいフローのテストを追加したか

## 注意事項

1. **END への接続を忘れない**: 最終ノードは必ず `graph.add_edge("final_node", END)` で END に接続する
2. **条件分岐の網羅性**: conditional_edges の分岐先は全て定義する
3. **State の初期化**: 新しいフィールドは `create_initial_state()` で初期化する
4. **後方互換性**: 既存のテストが通ることを確認する
