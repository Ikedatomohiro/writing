# UI Design Rules

## 必須: pencil MCPサーバーの使用

**UIデザインを作成・編集する際は、必ずpencil MCPサーバーを使用すること。**

### 対象作業

以下のすべての作業が対象:
- 新しいUI画面のデザイン
- 既存UIの修正・改善
- コンポーネントの作成
- プロトタイプの作成
- ワイヤーフレームの作成

### pencilツールの使い方

1. **エディタ状態の確認**: `get_editor_state`で現在の状態を確認
2. **ドキュメントを開く**: `open_document`で.penファイルを開くか新規作成
3. **ガイドライン取得**: `get_guidelines`でデザインルールを確認
4. **デザイン作成**: `batch_design`でUI要素を配置
5. **検証**: `get_screenshot`で結果を確認

### 禁止事項

- Figma、Sketch、Adobe XDなど他のデザインツールの使用
- HTMLやCSSで直接UIをデザインすること（実装フェーズは除く）
- .penファイルを`Read`や`Grep`ツールで直接読むこと（暗号化されているため`batch_get`を使用）

### ファイル配置

.penファイルは`design/`ディレクトリに配置する。

```
design/
  user-page.pen
  dashboard.pen
  components.pen
```

### ワークフロー

1. 要件を確認
2. `get_style_guide_tags` → `get_style_guide`でデザインの方向性を決定
3. `get_guidelines`で関連するガイドラインを取得
4. `batch_design`でUIを構築
5. `get_screenshot`で視覚的に検証
6. 必要に応じて調整を繰り返す
