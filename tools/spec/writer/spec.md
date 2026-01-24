# Writer Agent 仕様書

## 目的・背景

keyword_finderで発見したキーワードを活用し、SEOを意識した記事を自動生成するエージェント。
共通フレームワーク（BaseAgent, BaseNode）を使用して実装する3つ目のエージェントとして、
フレームワークの汎用性を検証する役割も持つ。

## 要件

### 機能要件

#### FR-1: 記事構成の計画
- 入力されたキーワードとトピックに基づいて記事の構成を計画
- 見出し構造（H2, H3）を決定
- 各セクションで扱う内容を定義

#### FR-2: 記事の執筆
- 計画に基づいて各セクションを執筆
- キーワードを自然に組み込む
- SEOを意識した文章を生成

#### FR-3: 品質チェック（内省）
- 記事がキーワードを適切に含んでいるか確認
- 構成が論理的か確認
- 不足があれば追加執筆を指示

#### FR-4: 結果統合
- 全セクションを統合して完成記事を出力
- メタデータ（タイトル、概要、キーワード）を付与

### 非機能要件

- 既存のBaseAgent/BaseNodeフレームワークを使用
- keyword_finder/evaluatorと同じパターンで実装
- 既存テストパターンを踏襲

## 入出力定義

### 入力 (WriterInput)

```python
class WriterInput(BaseModel):
    topic: str                    # 記事のトピック
    keywords: list[str]           # 使用するキーワード
    target_length: int = 2000     # 目標文字数
    tone: str = "informative"     # トーン（informative, casual, professional）
```

### 出力 (WriterOutput)

```python
class WriterOutput(BaseModel):
    title: str                    # 記事タイトル
    description: str              # 記事概要（メタディスクリプション用）
    content: str                  # 記事本文（Markdown形式）
    keywords_used: list[str]      # 実際に使用したキーワード
    sections: list[Section]       # セクション情報
    summary: str                  # 執筆結果のサマリー
```

## アーキテクチャ

### ノード構成（PERIパターン）

1. **PlannerNode**: 記事構成を計画
2. **ExecutorNode**: 各セクションを執筆（ツール呼び出し不要のためBaseNode継承可能）
3. **ReflectorNode**: 品質をチェック
4. **IntegratorNode**: 最終記事を統合

### ディレクトリ構造

```
src/agents/writer/
├── __init__.py
├── agent.py           # WriterAgent（BaseAgent継承）
├── nodes.py           # ノードクラス（BaseNode継承）
├── prompts/
│   ├── __init__.py
│   ├── planner.py
│   ├── executor.py
│   ├── reflector.py
│   └── integrator.py
└── schemas/
    ├── __init__.py
    ├── input.py
    ├── output.py
    └── state.py
```

## 制約事項

- 外部ツール（Web検索等）は使用しない（純粋なLLM生成）
- 既存のcoreフレームワークを変更しない
- 後方互換性のための関数も提供

## 成功基準

1. BaseAgent/BaseNodeを正しく継承している
2. 既存テスト（187件）がすべてパスする
3. writerエージェント用の新規テストがパスする
4. `run_writer()`関数で記事生成が動作する
