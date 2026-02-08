# 画像選定・生成機能 タスクリスト（TDD）

## Task 1: 画像スキーマ定義
- [ ] **Red**: `tests/agents/writer/schemas/test_image.py` を作成
  - ImageSuggestion のバリデーションテスト
  - ImageSuggestions の構造テスト
  - UnsplashPhoto のフィールドテスト
- [ ] **Green**: `src/agents/writer/schemas/image.py` を実装
- [ ] **Refactor**: 必要に応じて整理

## Task 2: WriterOutput 拡張
- [ ] **Red**: 既存の `tests/agents/test_writer.py` に image_suggestions テストを追加
  - WriterOutput に image_suggestions=None がデフォルトであること
  - WriterOutput に ImageSuggestions を設定できること
- [ ] **Green**: `schemas/output.py` の WriterOutput に Optional フィールド追加
- [ ] **Refactor**: 既存テストが全てパスすることを確認

## Task 3: AgentState 拡張
- [ ] **Red**: state に image_suggestions フィールドがあることをテスト
- [ ] **Green**: `schemas/state.py` にフィールド追加
- [ ] **Refactor**: schemas/__init__.py の更新

## Task 4: Unsplash APIクライアント
- [ ] **Red**: `tests/tools/test_unsplash.py` を作成
  - search_unsplash_photos の正常系テスト（モック）
  - APIキー未設定時の空リスト返却テスト
  - タイムアウト時のエラーハンドリングテスト
  - レスポンスパースのテスト
- [ ] **Green**: `src/tools/unsplash.py` を実装
- [ ] **Refactor**: tools/__init__.py の更新

## Task 5: 画像提案プロンプト
- [ ] **Red**: `tests/agents/writer/prompts/test_image_suggestion.py` を作成
  - プロンプト設定の構造テスト
- [ ] **Green**: `prompts/image_suggestion.py` を実装
- [ ] **Refactor**: prompts/__init__.py の更新

## Task 6: ImageSuggestionNode
- [ ] **Red**: `tests/agents/writer/nodes/test_image_suggestion.py` を作成
  - ノードの正常動作テスト（モック）
  - output が None の場合のスキップテスト
  - API未設定時のフォールバックテスト
  - state 更新の検証テスト
- [ ] **Green**: `nodes.py` に ImageSuggestionNode を実装
- [ ] **Refactor**: 必要に応じて整理

## Task 7: グラフ統合
- [ ] **Red**: `tests/agents/test_writer.py` にグラフ構造テストを追加
  - image_suggest ノードがグラフに含まれること
  - integrate → image_suggest → seo_optimize の順であること
- [ ] **Green**: `agent.py` を更新
- [ ] **Refactor**: __init__.py の更新、全テスト確認

## Task 8: 統合テスト・最終確認
- [ ] 全テスト実行（385 + 新規テスト）
- [ ] セルフチェック（セキュリティ、コード品質、構造）
- [ ] spec.md との整合性確認
