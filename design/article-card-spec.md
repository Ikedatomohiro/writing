# BlogArticleCard 仕様書

## 概要

ブログ記事一覧で使用する記事カードコンポーネント。トップページ、カテゴリ一覧ページで再利用される。

## 背景

- Issue: #20
- デザイン: `design/user-page.pen` の `Card/Article` (v54fK)
- 既存の `ArticleCard` は管理画面用のため、ブログ閲覧者向けの新コンポーネントを作成

## 機能要件

### 1. 表示要素

| 要素 | 必須 | 説明 |
|------|------|------|
| サムネイル画像 | 任意 | 180px高さ、画像がない場合はプレースホルダー表示 |
| カテゴリタグ | 必須 | カテゴリに応じた色で表示 |
| タイトル | 必須 | 最大2行で省略 |
| 概要（抜粋） | 必須 | 最大2行で省略 |
| 投稿日 | 必須 | YYYY.MM.DD 形式 |
| 読了時間 | 任意 | "X min read" 形式 |

### 2. カテゴリカラー

| カテゴリ | テーマ | アクセント色 | 背景色 |
|----------|--------|-------------|--------|
| asset | investment | #0891B2 | #ECFEFF |
| tech | programming | #7C3AED | #F5F3FF |
| health | health | #16A34A | #F0FDF4 |

### 3. インタラクション

- ホバー時: シャドウ追加、わずかなスケールアップ
- クリック: 記事詳細ページ（`/{category}/{slug}`）へ遷移
- カード全体がリンクとして機能

## 非機能要件

### パフォーマンス

- next/image を使用した画像最適化
- 遅延読み込み対応

### アクセシビリティ

- セマンティックなHTML（article要素）
- 適切なalt属性
- キーボードナビゲーション対応

## 入出力

### Props

```typescript
interface BlogArticleCardProps {
  article: ArticleMeta;
  readingTime?: string;  // オプション
}
```

### ArticleMeta 型（既存）

```typescript
interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: Category;  // "asset" | "tech" | "health"
  tags: string[];
  thumbnail?: string;
  published: boolean;
}
```

## デザイン仕様

```
┌─────────────────────────┐
│                         │
│      [サムネイル]        │  height: 180px
│                         │
├─────────────────────────┤
│ padding: 16px           │
│                         │
│ [カテゴリタグ]           │  fontSize: 12px
│                         │
│ タイトル（最大2行）       │  fontSize: 18px, fontWeight: 600
│                         │
│ 概要文（最大2行）         │  fontSize: 14px, lineHeight: 1.6
│                         │
│ 2024.01.15  5 min read  │  fontSize: 12px, color: muted
└─────────────────────────┘

- width: 320px（デフォルト、レスポンシブ対応）
- cornerRadius: 12px
- border: 1px solid $--border
- background: $--bg-card
```

## ファイル配置

```
components/
  blog/
    BlogArticleCard/
      BlogArticleCard.tsx
      BlogArticleCard.test.tsx
      index.ts
```

## 成功基準

- [ ] 全ての表示要素が正しく表示される
- [ ] カテゴリに応じた色が適用される
- [ ] ホバーエフェクトが動作する
- [ ] 記事詳細ページへ正しくリンクされる
- [ ] テストカバレッジ80%以上
