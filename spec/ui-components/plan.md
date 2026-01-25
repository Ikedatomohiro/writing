# 基本UIコンポーネント 実装計画

## 実装ステップ

### Step 1: コンポーネントディレクトリ構成

```
components/
  ui/
    Button/
      Button.tsx
      Button.test.tsx
      index.ts
    Link/
      Link.tsx
      Link.test.tsx
      index.ts
    Tag/
      Tag.tsx
      Tag.test.tsx
      index.ts
    index.ts
```

### Step 2: Buttonコンポーネント

1. 型定義（ButtonProps）
2. バリアント・サイズのスタイル定義
3. コンポーネント実装
4. テスト作成

### Step 3: Linkコンポーネント

1. 型定義（LinkProps）
2. Next.js Linkとの統合
3. コンポーネント実装
4. テスト作成

### Step 4: Tagコンポーネント

1. 型定義（TagProps）
2. バリアント・サイズのスタイル定義
3. コンポーネント実装
4. テスト作成

### Step 5: エクスポート設定

1. 各コンポーネントのindex.ts
2. components/ui/index.ts

## 影響を受けるファイル

| ファイル | 変更内容 |
|---------|---------|
| `components/ui/Button/` | 新規作成 |
| `components/ui/Link/` | 新規作成 |
| `components/ui/Tag/` | 新規作成 |
| `components/ui/index.ts` | 新規作成 |

## 依存関係

- #15 テーマシステム（マージ済み）
- #16 タイポグラフィ（PR作成済み）

## テスト計画

- 各コンポーネントのユニットテスト
- バリアント・サイズの表示テスト
- アクセシビリティテスト

## リスクと対策

| リスク | 対策 |
|--------|------|
| スタイルの不整合 | CSS変数を一貫して使用 |
| RSC非対応 | "use client"を明示 |
