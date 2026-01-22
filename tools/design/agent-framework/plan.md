# Agent Framework 実装計画

## 実装フェーズ

段階的に実装し、各フェーズで動作確認を行う。

---

## Phase 1: 最小限の共通基盤

### 目的

ノード基底クラスと共通スキーマを作成し、コード重複を削減する基盤を整える。

### 実装内容

#### 1.1 ディレクトリ作成

```
tools/src/core/
├── __init__.py
├── base_node.py
└── base_state.py
```

#### 1.2 base_state.py

共通スキーマを定義：

```python
class BaseReflection(BaseModel):
    """内省結果の基底スキーマ"""
    is_sufficient: bool
    feedback: str

class BaseToolResult(BaseModel):
    """ツール実行結果の基底スキーマ"""
    tool_name: str
    query: str
    results: list[Any]
```

#### 1.3 base_node.py

ノード基底クラスを定義：

```python
class BaseNode(ABC):
    def __init__(self, system_prompt, user_prompt_template, output_schema): ...

    @abstractmethod
    def extract_variables(self, state: dict) -> dict: ...

    @abstractmethod
    def update_state(self, result, state: dict) -> dict: ...

    def __call__(self, state: dict) -> dict: ...
```

特化ノードクラス：
- `PlannerNode(BaseNode)` - 計画立案用
- `ReflectorNode(BaseNode)` - 内省用
- `IntegratorNode(BaseNode)` - 結果統合用

#### 1.4 共通ユーティリティ

```python
def should_continue(state: dict, max_retry: int = 3) -> str:
    """継続判定の共通ロジック"""
```

### 成果物

- `tools/src/core/__init__.py`
- `tools/src/core/base_node.py`
- `tools/src/core/base_state.py`
- 単体テスト

---

## Phase 2: keyword_finder 移行

### 目的

既存の keyword_finder を共通フレームワークに移行し、動作確認する。

### 実装内容

#### 2.1 ノード実装の移行

各ノードを `BaseNode` 継承に書き換え：

```python
# nodes.py
class KeywordPlannerNode(PlannerNode):
    def extract_variables(self, state):
        input_data = state["input"]
        return {
            "category": input_data.category,
            "seed_keywords": ", ".join(input_data.seed_keywords),
            "depth": input_data.depth,
        }
```

#### 2.2 プロンプト整理

プロンプトを設定ファイルに集約：

```python
# prompts.py
PLANNER_CONFIG = {
    "system_prompt": PLANNER_SYSTEM_PROMPT,
    "user_prompt_template": PLANNER_USER_PROMPT,
    "output_schema": Plan,
}
```

#### 2.3 agent.py 簡素化

グラフ構築ロジックを整理。

### 成果物

- `tools/src/agents/keyword_finder/nodes.py`（新規）
- `tools/src/agents/keyword_finder/agent.py`（更新）
- 既存テストがパスすること

---

## Phase 3: evaluator 移行

### 目的

evaluator も共通フレームワークに移行。

### 実装内容

Phase 2 と同様の手順で移行。
goal_creator ノードなど固有のノードは BaseNode を継承して実装。

### 成果物

- `tools/src/agents/evaluator/nodes.py`（新規）
- `tools/src/agents/evaluator/agent.py`（更新）
- 既存テストがパスすること

---

## Phase 4: BaseAgent 実装

### 目的

エージェント構築の共通化。グラフ構築ロジックを基底クラスに抽出。

### 実装内容

```python
# core/base_agent.py
class BaseAgent(ABC):
    @abstractmethod
    def get_nodes(self) -> dict[str, callable]: ...

    @abstractmethod
    def get_initial_state(self, input_data) -> dict: ...

    def build_graph(self) -> StateGraph: ...

    def run(self, input_data) -> Any: ...
```

### 成果物

- `tools/src/core/base_agent.py`
- keyword_finder / evaluator を BaseAgent 継承に更新
- 単体テスト

---

## Phase 5: 新規エージェント作成（検証）

### 目的

共通フレームワークで新しいエージェント（writer等）を作成し、設計の妥当性を検証。

### 実装内容

- プロンプトとスキーマの定義
- BaseNode 継承ノードの実装
- BaseAgent 継承エージェントの実装

### 成功基準

- コピペなしで新エージェントが作成できる
- 既存コードの修正が不要

---

## Phase 6: オーケストレーター（将来）

### 目的

複数エージェントの連携制御。

### 実装内容

- タスク分解ロジック
- エージェント選択・ルーティング
- コンテキスト受け渡し
- 結果統合

---

## リスクと対策

| リスク | 影響 | 対策 |
|--------|------|------|
| 移行時のバグ混入 | 既存機能の破壊 | 各フェーズで既存テスト実行 |
| 過剰な抽象化 | 複雑性増加 | 最小限の抽象化から開始 |
| 固有ロジックの扱い | 共通化できない部分 | 継承・オーバーライドで対応 |

## 依存関係

```
Phase 1 ─→ Phase 2 ─→ Phase 3 ─→ Phase 4 ─→ Phase 5 ─→ Phase 6
  │           │           │           │
  └─ 単体テスト   └─ 結合テスト   └─ 結合テスト   └─ E2Eテスト
```
