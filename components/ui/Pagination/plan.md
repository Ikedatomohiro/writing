# Pagination コンポーネント実装計画

## 実装ステップ

### 1. テストファイル作成

- `Pagination.test.tsx` を作成
- 基本的なレンダリングテストを記述

### 2. 型定義

- `PaginationProps` インターフェースを定義
- 省略表示用の型を定義

### 3. ページ番号計算ロジック

- `getVisiblePages` ヘルパー関数を実装
- 省略表示のロジックを実装

### 4. コンポーネント実装

- Pagination コンポーネントを実装
- Chakra UI を使用
- lucide-react アイコンを使用

### 5. スタイリング

- デザインシステムに準拠したスタイル適用
- テーマカラー対応

### 6. アクセシビリティ対応

- aria属性の追加
- キーボードナビゲーション

## 影響を受けるファイル

### 新規作成

- `components/ui/Pagination/Pagination.tsx`
- `components/ui/Pagination/Pagination.test.tsx`
- `components/ui/Pagination/index.ts`

### 変更

- `components/ui/index.ts` - Paginationのエクスポート追加

## 依存関係

- `@chakra-ui/react` - UIコンポーネント
- `lucide-react` - アイコン（chevron-left, chevron-right）

## テスト計画

### ユニットテスト

1. **レンダリングテスト**
   - コンポーネントが正しくレンダリングされる
   - 現在ページがハイライトされる

2. **ナビゲーションテスト**
   - 前へボタンで前のページに移動
   - 次へボタンで次のページに移動
   - ページ番号クリックで該当ページに移動

3. **境界値テスト**
   - 最初のページで前へボタンが非活性
   - 最後のページで次へボタンが非活性

4. **省略表示テスト**
   - 総ページ数が少ない場合は省略なし
   - 総ページ数が多い場合は省略表示

5. **アクセシビリティテスト**
   - 適切なaria属性が設定されている

## リスクと対策

| リスク | 対策 |
|--------|------|
| lucide-react未インストール | package.jsonを確認し、必要に応じてインストール |
| テーマカラーの動的切り替え | CSS変数を使用し、親コンポーネントで制御 |
