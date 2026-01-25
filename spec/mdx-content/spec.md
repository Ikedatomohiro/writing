# Markdown/MDX記事管理 仕様書

## 背景

ブログ記事をファイルベースで管理し、MDXを使用してカスタムコンポーネントを埋め込み可能にする。データベース不要で、ビルド時に静的生成（SSG）する。

## 目的

- Markdown/MDXファイルから記事データを取得できる
- フロントマターでメタ情報（タイトル、日付、カテゴリ等）を管理できる
- 記事一覧・詳細ページで表示できる

## 機能要件

### 1. ディレクトリ構成

```
content/
├── asset/          # 資産形成カテゴリ
│   ├── article1.mdx
│   └── article2.mdx
├── tech/           # プログラミングカテゴリ
│   └── ...
└── health/         # 健康カテゴリ
    └── ...
```

### 2. フロントマター定義

```yaml
---
title: 記事タイトル
description: 記事の概要
date: 2026-01-24
updatedAt: 2026-01-25
category: asset
tags: [投資, 節約]
thumbnail: /images/thumbnail.jpg
published: true
---
```

**必須フィールド**:
- `title`: 記事タイトル
- `description`: 記事の概要（SEO用）
- `date`: 公開日
- `category`: カテゴリ（asset | tech | health）

**オプションフィールド**:
- `updatedAt`: 更新日
- `tags`: タグ配列
- `thumbnail`: サムネイル画像パス
- `published`: 公開状態（デフォルト: true）

### 3. 記事取得ユーティリティ

#### 3.1 記事一覧取得

```typescript
// カテゴリ別に記事一覧を取得
getArticlesByCategory(category: Category): Promise<ArticleMeta[]>

// 全記事を取得
getAllArticles(): Promise<ArticleMeta[]>

// 最新記事を取得
getLatestArticles(limit: number): Promise<ArticleMeta[]>
```

#### 3.2 記事詳細取得

```typescript
// スラッグから記事を取得
getArticleBySlug(category: Category, slug: string): Promise<Article | null>
```

#### 3.3 関連記事取得

```typescript
// 同一カテゴリの記事を取得
getRelatedArticles(category: Category, currentSlug: string, limit: number): Promise<ArticleMeta[]>
```

### 4. MDX設定

- `next-mdx-remote`を使用（Server Components対応）
- シンタックスハイライト（rehype-pretty-code）
- GFM（GitHub Flavored Markdown）サポート

### 5. 型定義

```typescript
type Category = 'asset' | 'tech' | 'health';

interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  updatedAt?: string;
  category: Category;
  tags?: string[];
  thumbnail?: string;
  published: boolean;
}

interface Article extends ArticleMeta {
  content: string;  // MDXコンテンツ
}
```

## 非機能要件

- ファイルベース（DB不要）
- ビルド時に静的生成（SSG）
- TypeScriptで型安全に実装

## 制約事項

- Next.js 15 (App Router)
- Server Components優先
- Chakra UIでスタイリング

## 成功基準

- [ ] contentディレクトリにMDXファイルを配置できる
- [ ] フロントマターからメタ情報を取得できる
- [ ] カテゴリ別に記事一覧を取得できる
- [ ] スラッグから記事詳細を取得できる
- [ ] MDXコンテンツをHTMLにレンダリングできる
- [ ] 全テストが通る
- [ ] ビルドが成功する
