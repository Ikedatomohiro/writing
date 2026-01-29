# カテゴリ専門化 タスクリスト (Issue #42)

## タスク一覧

### 1. カテゴリ設定スキーマ & ローダー
- [x] テスト作成: `tests/common/test_category_config.py`
- [x] テスト失敗確認 (Red)
- [x] 実装: `src/common/category_config.py`
- [x] テスト成功確認 (Green)
- [x] `src/common/__init__.py` にエクスポート追加

### 2. カテゴリ別 YAML ファイル
- [x] `config/categories/asset.yaml` 作成
- [x] `config/categories/programming.yaml` 作成
- [x] `config/categories/health.yaml` 作成
- [x] ローダーで3ファイルとも読み込めることを確認

### 3. WriterInput 拡張
- [x] テスト作成: category フィールドのテスト
- [x] テスト失敗確認 (Red)
- [x] `schemas/input.py` に category 追加
- [x] テスト成功確認 (Green)

### 4. プロンプト注入
- [x] テスト作成: カテゴリ情報がプロンプト変数に含まれるテスト
- [x] テスト失敗確認 (Red)
- [x] nodes.py の各ノードにカテゴリ情報注入を実装
- [x] テスト成功確認 (Green)

### 5. 統合テスト & 後方互換性
- [x] 既存テストが全て通ることを確認
- [x] カテゴリ未指定時の動作テスト
- [x] 全テスト実行

### 6. PR 作成
- [ ] セルフレビュー
- [ ] PR 作成（Closes Ikedatomohiro/writing-task#42）
