# テーマシステム実装計画

## 実装ステップ

### Step 1: Tailwind CSS v4 導入

1. パッケージインストール
   ```bash
   npm install tailwindcss @tailwindcss/postcss postcss
   ```

2. PostCSS設定（`postcss.config.mjs`）

3. グローバルCSS作成（`app/globals.css`）
   - Tailwind v4は `@import "tailwindcss"` 形式

4. layout.tsxでglobals.cssをインポート

### Step 2: カラートークン定義

1. `app/globals.css` にCSS変数を定義
   - ベースカラー
   - カテゴリ別テーマカラー（`[data-theme="xxx"]` セレクタ）

2. `tailwind.config.ts` でカスタムカラーを定義
   - CSS変数を参照する形式

### Step 3: テーマ切り替えロジック

1. `lib/theme/` ディレクトリ作成
   - `types.ts`: テーマ型定義
   - `constants.ts`: テーマ定数
   - `utils.ts`: パスからテーマを判定する関数

2. `ThemeProvider` コンポーネント作成
   - Server Componentで実装
   - パスに応じて `data-theme` 属性を設定

3. layout.tsxでThemeProviderを使用

### Step 4: テスト

1. ユーティリティ関数のテスト
2. ビルド確認

## 影響を受けるファイル

### 新規作成
- `postcss.config.mjs`
- `tailwind.config.ts`
- `app/globals.css`
- `lib/theme/types.ts`
- `lib/theme/constants.ts`
- `lib/theme/utils.ts`
- `lib/theme/utils.test.ts`

### 変更
- `package.json`（依存追加）
- `app/layout.tsx`（CSS import、ThemeProvider）

## 依存関係

```
Step 1 → Step 2 → Step 3 → Step 4
```

## リスクと対策

| リスク | 対策 |
|--------|------|
| Chakra UIとの競合 | スタイルの優先順位を確認、必要に応じて調整 |
| Tailwind v4の新しい構文 | 公式ドキュメントを確認 |
| SSR時のハイドレーション不整合 | suppressHydrationWarningを適切に使用 |
