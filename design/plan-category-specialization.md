# カテゴリ専門化 実装計画 (Issue #42)

## 実装ステップ

### Step 1: カテゴリ設定スキーマ（Pydantic モデル）
- `tools/src/common/category_config.py` に CategorySpec / CategoryConfigLoader を定義
- YAML → Pydantic バリデーション

### Step 2: カテゴリ別 YAML ファイル作成
- `tools/config/categories/asset.yaml`
- `tools/config/categories/programming.yaml`
- `tools/config/categories/health.yaml`

### Step 3: WriterInput に category フィールド追加
- `tools/src/agents/writer/schemas/input.py` に `category: str | None` 追加
- 既存コードへの影響なし（Optional）

### Step 4: プロンプト注入の仕組み
- カテゴリ設定をプロンプト変数に変換するヘルパー関数
- AngleProposalNode, PlannerNode, ExecutorNode に注入

### Step 5: 既存テスト修正 & 新規テスト
- 既存テストの後方互換性確認
- CategorySpec / Loader のユニットテスト
- プロンプト注入のテスト

## 影響ファイル

| ファイル | 変更内容 |
|---------|---------|
| `tools/src/common/category_config.py` | **新規** - スキーマ & ローダー |
| `tools/src/common/__init__.py` | エクスポート追加 |
| `tools/config/categories/*.yaml` | **新規** - 3カテゴリ |
| `tools/src/agents/writer/schemas/input.py` | category フィールド追加 |
| `tools/src/agents/writer/nodes.py` | プロンプト変数にカテゴリ注入 |
| `tools/tests/common/test_category_config.py` | **新規** - ユニットテスト |
| `tools/tests/agents/test_writer.py` | カテゴリ関連テスト追加 |

## 依存関係

- #38（ペルソナ管理）: persona.yaml は触らない。カテゴリ設定は独立して機能する
- 将来 #38 マージ後に統合ポイントを追加可能

## リスクと対策

| リスク | 対策 |
|--------|------|
| #38 との設計衝突 | カテゴリは補完設計。persona.yaml 非依存 |
| 既存テスト破壊 | category はオプショナル。デフォルト None |
| YAML スキーマ変更 | Pydantic で厳密バリデーション |
