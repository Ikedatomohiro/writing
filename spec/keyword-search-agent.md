# キーワード検索エージェント スペック

## 概要

資産形成・健康・エンジニアリングの分野において、記事執筆のためのキーワードを探索・提案するエージェント。

## 目的

- トレンドキーワードの発見
- 記事にできるニッチなキーワードの特定
- 関連キーワードの深掘り

## 対象分野

1. **資産形成**: 年金, iDeCo, 積立NISA, 積立型保険, 投資信託, 家計管理
2. **健康**: 健康管理, 健康食品, 健康サポート, 睡眠, 運動, メンタルヘルス
3. **エンジニア**: AI, バックエンド, インフラ, クラウド, DevOps

---

## アーキテクチャ

### フレームワーク

- **LangGraph**: ワークフロー制御
- **LangChain**: ツール統合

### 処理フロー

```
[入力: 分野/シードキーワード]
        ↓
    ┌─────────────┐
    │  計画立案   │  ← どのツールで何を調べるか決定
    └─────────────┘
        ↓
    ┌─────────────┐
    │ ツール選択  │  ← 適切な検索ツールを選択
    └─────────────┘
        ↓
    ┌─────────────┐
    │  検索実行   │  ← 複数ツールを並列実行
    └─────────────┘
        ↓
    ┌─────────────┐
    │  結果統合   │  ← キーワードを整理・ランキング
    └─────────────┘
        ↓
    ┌─────────────┐
    │   内省     │  ← 結果が十分か評価（不足なら再検索）
    └─────────────┘
        ↓
[出力: キーワードリスト + 推奨度]
```

### リトライメカニズム

- 最大3回までリトライ
- 内省で不十分と判断された場合、ツール選択に戻る

---

## データモデル

### 入力

```python
class KeywordSearchInput(BaseModel):
    """キーワード検索の入力"""
    category: str  # 分野（資産形成/健康/エンジニア）
    seed_keywords: list[str]  # シードキーワード
    depth: int = 2  # 深掘りレベル（1-3）
```

### 出力

```python
class KeywordResult(BaseModel):
    """キーワード検索結果"""
    keyword: str  # キーワード
    search_volume: int | None  # 検索ボリューム（推定）
    competition: str  # 競合度（低/中/高）
    relevance_score: float  # 関連度スコア（0-1）
    suggested_topics: list[str]  # 記事トピック案

class KeywordSearchOutput(BaseModel):
    """最終出力"""
    category: str
    seed_keywords: list[str]
    results: list[KeywordResult]
    summary: str  # 分析サマリー
```

### 内部状態

```python
class AgentState(TypedDict):
    """エージェント状態"""
    input: KeywordSearchInput
    plan: Plan | None
    tool_results: list[ToolResult]
    current_keywords: list[str]
    reflection: ReflectionResult | None
    retry_count: int
    final_output: KeywordSearchOutput | None
```

---

## ツール

### 1. Web検索ツール

```python
@tool
def search_web(query: str) -> list[SearchResult]:
    """Webからトレンドキーワードを検索"""
    # Google Search API / SerpAPI を使用
```

### 2. 関連キーワード取得ツール

```python
@tool
def get_related_keywords(keyword: str) -> list[str]:
    """関連キーワード・サジェストを取得"""
    # Google Suggest API / KeywordTool API を使用
```

### 3. トレンド分析ツール

```python
@tool
def analyze_trends(keywords: list[str]) -> list[TrendData]:
    """キーワードのトレンドを分析"""
    # Google Trends API を使用
```

### 4. 競合分析ツール

```python
@tool
def analyze_competition(keyword: str) -> CompetitionData:
    """キーワードの競合度を分析"""
    # 検索結果から競合サイトを分析
```

---

## プロンプト

### 計画立案プロンプト

```
あなたはキーワードリサーチの専門家です。
与えられた分野とシードキーワードから、記事執筆に適したキーワードを見つける計画を立ててください。

# 入力
- 分野: {category}
- シードキーワード: {seed_keywords}
- 深掘りレベル: {depth}

# 出力
以下の形式でサブタスクを出力してください：
1. [ツール名] で [目的] を調査
2. ...
```

### 内省プロンプト

```
検索結果を評価してください。

# 評価基準
- 十分な数のキーワードが見つかったか（最低10個）
- 記事にできる具体性があるか
- 競合が適度か（ニッチすぎず、激戦区すぎず）

# 判定
- 十分: 最終回答を生成
- 不十分: 追加で調査すべき観点を提案
```

---

## ディレクトリ構成

```
src/
├── agents/
│   └── keyword_search/
│       ├── __init__.py
│       ├── agent.py       # メインエージェント（LangGraph）
│       ├── state.py       # 状態定義
│       ├── prompts.py     # プロンプト
│       └── nodes/
│           ├── planner.py      # 計画立案ノード
│           ├── tool_selector.py # ツール選択ノード
│           ├── executor.py      # 実行ノード
│           ├── integrator.py    # 結果統合ノード
│           └── reflector.py     # 内省ノード
├── tools/
│   ├── __init__.py
│   ├── web_search.py
│   ├── related_keywords.py
│   ├── trend_analyzer.py
│   └── competition_analyzer.py
├── models/
│   ├── __init__.py
│   ├── input.py
│   ├── output.py
│   └── state.py
└── main.py                # エントリーポイント
```

---

## 設定

### 環境変数

```bash
OPENAI_API_KEY=xxx          # OpenAI API
SERPAPI_API_KEY=xxx         # SerpAPI（Web検索用）
GOOGLE_TRENDS_API_KEY=xxx   # Google Trends（オプション）
```

### configs.py

```python
class Config:
    MAX_RETRY_COUNT = 3
    MAX_SEARCH_RESULTS = 10
    DEFAULT_DEPTH = 2
    MODEL_NAME = "gpt-4o-mini"
```

---

## 実行例

### 入力

```python
input = KeywordSearchInput(
    category="資産形成",
    seed_keywords=["iDeCo", "積立NISA"],
    depth=2
)
```

### 出力

```python
KeywordSearchOutput(
    category="資産形成",
    seed_keywords=["iDeCo", "積立NISA"],
    results=[
        KeywordResult(
            keyword="iDeCo 始め方 2024",
            search_volume=5400,
            competition="中",
            relevance_score=0.92,
            suggested_topics=["iDeCoの始め方完全ガイド", "2024年版iDeCo口座開設手順"]
        ),
        KeywordResult(
            keyword="積立NISA iDeCo 併用",
            search_volume=2900,
            competition="低",
            relevance_score=0.88,
            suggested_topics=["積立NISAとiDeCoの賢い併用術"]
        ),
        # ...
    ],
    summary="iDeCoと積立NISAの併用に関するキーワードが狙い目。特に初心者向けの解説記事に需要あり。"
)
```

---

## 次のステップ

1. [ ] 基本的なディレクトリ構成を作成
2. [ ] データモデルを実装
3. [ ] ツールを実装（まずはWeb検索から）
4. [ ] LangGraphでワークフローを構築
5. [ ] プロンプトを調整
6. [ ] テストを作成
