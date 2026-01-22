# Agent Framework 仕様書

## 概要

マルチエージェントシステム構築のための共通フレームワーク。
プロンプトとスキーマを差し替えるだけで新しいエージェントを作成可能にする。

## 背景

現在、`keyword_finder` と `evaluator` の2つのエージェントが存在するが、
同じPERIパターン（Plan-Execute-Reflect-Integrate）を採用しているにも関わらず、
コードの重複が多く再利用性が低い。

3つ以上のエージェントを作成し、マルチエージェント連携を実現するため、
共通フレームワークの構築が必要。

## 機能要件

### FR-1: ノード基底クラス

- プロンプト（system/user）をコンストラクタで注入可能
- 出力スキーマをコンストラクタで注入可能
- 状態からのプロンプト変数抽出をサブクラスで実装
- 状態更新ロジックをサブクラスで実装

### FR-2: 共通スキーマ

- `BaseReflection`: 内省結果の共通スキーマ（is_sufficient, feedback）
- `BaseToolResult`: ツール実行結果の共通スキーマ

### FR-3: 共通ロジック

- `should_continue()`: リトライ制御の共通ロジック
- 最大リトライ回数の設定可能

### FR-4: エージェント基底クラス（Phase 2）

- グラフ構築の共通化
- 初期状態生成の抽象化
- 実行フローの統一

### FR-5: オーケストレーター（Phase 4）

- 複数エージェントの連携制御
- エージェント間のコンテキスト受け渡し
- タスク分解と結果統合

## 非機能要件

### NFR-1: 後方互換性

- 既存の `keyword_finder` と `evaluator` が移行後も同じ動作をすること

### NFR-2: テスタビリティ

- 各ノードが単体テスト可能であること
- モックの注入が容易であること

### NFR-3: 拡張性

- 新しいノードタイプの追加が容易であること
- PERIパターン以外のワークフローも構築可能であること

## 制約事項

- LangGraph / LangChain を使用
- Python 3.13
- 既存のツール（search_web, get_related_keywords）を継続使用

## 成功基準

1. 新しいエージェントを作成する際、ノードロジックのコピペが不要
2. プロンプトとスキーマの定義のみで新ノードを作成可能
3. 既存エージェントのテストが移行後もパスする
4. 3つ目のエージェント（writer等）が共通フレームワークで実装可能

## アーキテクチャ

```
tools/src/
├── core/                          # 共通フレームワーク
│   ├── __init__.py
│   ├── base_node.py               # ノード基底クラス
│   ├── base_state.py              # 共通スキーマ
│   ├── base_agent.py              # エージェント基底クラス（Phase 2）
│   └── orchestrator.py            # オーケストレーター（Phase 4）
│
├── agents/
│   ├── keyword_finder/
│   │   ├── nodes.py               # ノード実装（BaseNode継承）
│   │   ├── schemas.py             # エージェント固有スキーマ
│   │   ├── prompts.py             # プロンプト定義
│   │   └── agent.py               # エージェント定義
│   ├── evaluator/
│   │   └── ...
│   └── writer/                    # 新規エージェント
│       └── ...
```

## 参考: PERIパターン

```
Plan → Execute → Reflect ⟳ → Integrate
  │                  │
  │                  ├─ is_sufficient=True → Integrate
  │                  └─ is_sufficient=False → Execute（リトライ）
  │
  └─ max_retry到達 → Integrate（強制終了）
```
