---
name: seo-jsonld-generator
description: Next.jsページにJSON-LD構造化データを追加する。Article、BreadcrumbList、WebSite等のスキーマを生成する際に使用する。
---

# SEO JSON-LD Generator

Next.js ページに JSON-LD 構造化データを追加するパターン。

## 概要

JSON-LD（JavaScript Object Notation for Linked Data）は、検索エンジンがページの内容を理解するための構造化データ形式。Google検索結果のリッチスニペット表示に使用される。

## 主要なスキーマタイプ

| タイプ | 用途 | 表示例 |
|--------|------|--------|
| Article | ブログ記事 | 公開日、著者、画像 |
| BreadcrumbList | パンくずリスト | 階層ナビゲーション |
| WebSite | サイト全体 | サイト名、検索ボックス |
| Organization | 組織情報 | ロゴ、連絡先 |
| FAQPage | FAQ | 質問と回答 |

## 実装手順

### Step 1: 生成関数を作成

```typescript
// lib/seo/jsonld.ts

interface ArticleJsonLdParams {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  url: string;
  image?: string;
  authorName: string;
}

export function generateArticleJsonLd(params: ArticleJsonLdParams) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.title,
    description: params.description,
    datePublished: params.datePublished,
    dateModified: params.dateModified || params.datePublished,
    url: params.url,
    image: params.image,
    author: {
      "@type": "Person",
      name: params.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: params.authorName,
      // logo: { "@type": "ImageObject", url: "https://..." },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": params.url,
    },
  };
}
```

### Step 2: BreadcrumbList 生成関数

```typescript
// lib/seo/jsonld.ts

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
```

### Step 3: WebSite 生成関数

```typescript
// lib/seo/jsonld.ts

interface WebSiteJsonLdParams {
  name: string;
  url: string;
  description: string;
}

export function generateWebSiteJsonLd(params: WebSiteJsonLdParams) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: params.name,
    url: params.url,
    description: params.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${params.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
```

### Step 4: ページコンポーネントで使用

```tsx
// app/(public)/[category]/[slug]/page.tsx
import { generateArticleJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo/jsonld";
import { SITE_CONFIG } from "@/lib/constants/site";

export default async function ArticlePage({ params }) {
  const article = await getArticle(params.slug);
  const fullUrl = `${SITE_CONFIG.url}/${params.category}/${params.slug}`;

  // JSON-LD生成
  const articleJsonLd = generateArticleJsonLd({
    title: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.updatedAt,
    url: fullUrl,
    image: article.thumbnail,
    authorName: SITE_CONFIG.name,
  });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "ホーム", url: SITE_CONFIG.url },
    { name: "カテゴリ", url: `${SITE_CONFIG.url}/${params.category}` },
    { name: article.title, url: fullUrl },
  ]);

  return (
    <>
      {/* JSON-LD構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* ページコンテンツ */}
      <article>
        <h1>{article.title}</h1>
        {/* ... */}
      </article>
    </>
  );
}
```

### Step 5: レイアウトで共通データを追加

```tsx
// app/layout.tsx
import { generateWebSiteJsonLd } from "@/lib/seo/jsonld";
import { SITE_CONFIG } from "@/lib/constants/site";

export default function RootLayout({ children }) {
  const webSiteJsonLd = generateWebSiteJsonLd({
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
  });

  return (
    <html lang="ja">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## 完全な実装例

```typescript
// lib/seo/jsonld.ts

// ==================== 型定義 ====================

interface ArticleJsonLdParams {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  url: string;
  image?: string;
  authorName: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface WebSiteJsonLdParams {
  name: string;
  url: string;
  description: string;
}

// ==================== 生成関数 ====================

/**
 * Article JSON-LD を生成
 */
export function generateArticleJsonLd(params: ArticleJsonLdParams) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.title,
    description: params.description,
    datePublished: params.datePublished,
    dateModified: params.dateModified || params.datePublished,
    url: params.url,
    author: {
      "@type": "Person",
      name: params.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: params.authorName,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": params.url,
    },
  };

  if (params.image) {
    jsonLd.image = params.image;
  }

  return jsonLd;
}

/**
 * BreadcrumbList JSON-LD を生成
 */
export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * WebSite JSON-LD を生成
 */
export function generateWebSiteJsonLd(params: WebSiteJsonLdParams) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: params.name,
    url: params.url,
    description: params.description,
  };
}
```

## テスト

```typescript
// lib/seo/__tests__/jsonld.test.ts
import { describe, it, expect } from "vitest";
import {
  generateArticleJsonLd,
  generateBreadcrumbJsonLd,
  generateWebSiteJsonLd,
} from "../jsonld";

describe("generateArticleJsonLd", () => {
  it("generates valid Article JSON-LD", () => {
    const result = generateArticleJsonLd({
      title: "テスト記事",
      description: "テスト説明",
      datePublished: "2026-01-27",
      url: "https://example.com/article",
      authorName: "著者名",
    });

    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("Article");
    expect(result.headline).toBe("テスト記事");
  });

  it("includes image when provided", () => {
    const result = generateArticleJsonLd({
      title: "テスト",
      description: "説明",
      datePublished: "2026-01-27",
      url: "https://example.com/article",
      authorName: "著者",
      image: "https://example.com/image.jpg",
    });

    expect(result.image).toBe("https://example.com/image.jpg");
  });
});

describe("generateBreadcrumbJsonLd", () => {
  it("generates valid BreadcrumbList JSON-LD", () => {
    const result = generateBreadcrumbJsonLd([
      { name: "ホーム", url: "https://example.com" },
      { name: "カテゴリ", url: "https://example.com/category" },
    ]);

    expect(result["@type"]).toBe("BreadcrumbList");
    expect(result.itemListElement).toHaveLength(2);
    expect(result.itemListElement[0].position).toBe(1);
    expect(result.itemListElement[1].position).toBe(2);
  });
});
```

## 検証ツール

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

## チェックリスト

実装時の確認事項:

- [ ] `@context` と `@type` が正しく設定されているか
- [ ] 必須フィールドが全て含まれているか
- [ ] URLが絶対パスになっているか（相対パスはNG）
- [ ] 日付がISO 8601形式か（YYYY-MM-DD）
- [ ] Rich Results Testでエラーがないか
- [ ] `dangerouslySetInnerHTML` で正しく埋め込んでいるか
- [ ] 複数のJSON-LDは別々の `<script>` タグで出力しているか

## 参考

- [Schema.org](https://schema.org/)
- [Google 構造化データガイドライン](https://developers.google.com/search/docs/appearance/structured-data)
- 既存実装: `lib/seo/jsonld.ts`
