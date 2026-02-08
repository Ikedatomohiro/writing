# 画像選定・生成機能 実装計画

## 実装ステップ

### Phase 1: スキーマ定義

1. `schemas/image.py` を新規作成
   - ImageSuggestion: 個別画像の提案
   - ImageSuggestions: 全画像提案のまとめ
   - UnsplashPhoto: Unsplash API レスポンスのモデル

2. `schemas/output.py` を更新
   - WriterOutput に `image_suggestions` フィールドを追加（Optional）

3. `schemas/state.py` を更新
   - AgentState に `image_suggestions` フィールドを追加

4. `schemas/__init__.py` を更新
   - 新スキーマのエクスポートを追加

### Phase 2: Unsplash APIクライアント

5. `src/tools/unsplash.py` を新規作成
   - `search_unsplash_photos(query, per_page=5)` 関数
   - httpx を使用（既存の依存関係にあり）
   - 環境変数 `UNSPLASH_ACCESS_KEY` からキー取得
   - APIキー未設定時は空リストを返す

6. `src/tools/__init__.py` を更新
   - unsplash 関数のエクスポートを追加

### Phase 3: プロンプト定義

7. `prompts/image_suggestion.py` を新規作成
   - 記事内容から画像検索クエリを生成するプロンプト
   - アイキャッチ・本文挿入・OGP それぞれの検索クエリ生成

8. `prompts/__init__.py` を更新
   - 新プロンプトのエクスポートを追加

### Phase 4: ノード実装

9. `nodes.py` に ImageSuggestionNode を追加
   - ResearchNode と同様、BaseNode を継承しない設計
   - Step 1: LLMで画像検索クエリ生成
   - Step 2: Unsplash API で画像検索
   - Step 3: 結果を ImageSuggestions に整形

### Phase 5: グラフ統合

10. `agent.py` を更新
    - ImageSuggestionNode をノードに追加
    - グラフフロー: integrate → image_suggest → seo_optimize → END
    - create_initial_state に image_suggestions を追加

11. `__init__.py` を更新
    - ImageSuggestionNode のエクスポートを追加

### Phase 6: 出力統合

12. IntegratorNode または SeoOptimizerNode の update_state を更新
    - WriterOutput に image_suggestions を含める

## 影響を受けるファイル

| ファイル | 変更内容 |
|---------|---------|
| `schemas/image.py` | 新規 |
| `schemas/output.py` | image_suggestions フィールド追加 |
| `schemas/state.py` | image_suggestions フィールド追加 |
| `schemas/__init__.py` | エクスポート追加 |
| `src/tools/unsplash.py` | 新規 |
| `src/tools/__init__.py` | エクスポート追加 |
| `prompts/image_suggestion.py` | 新規 |
| `prompts/__init__.py` | エクスポート追加 |
| `nodes.py` | ImageSuggestionNode 追加 |
| `agent.py` | グラフにノード追加 |
| `__init__.py` | エクスポート追加 |

## リスクと対策

| リスク | 対策 |
|--------|------|
| Unsplash APIキー未設定 | フォールバックで空結果を返す |
| API Rate Limit | 1記事あたり最大5回に制限 |
| 既存テスト破壊 | image_suggestions をOptionalにする |
| LLMの検索クエリ品質 | 英語キーワードへの変換をプロンプトで指示 |
