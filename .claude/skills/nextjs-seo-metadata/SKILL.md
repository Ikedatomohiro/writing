---
name: nextjs-seo-metadata
description: Next.js Metadata APIを使ったSEO/OGP設定パターン。メタタグ、OGP、Twitter Card、構造化データ(JSON-LD)の実装に使用する。
---

# Next.js SEO Metadata

Next.js App Router の Metadata API を使用した SEO/OGP 設定パターン。

## 基本構成

### 静的メタデータ（layout.tsx / page.tsx）

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "サイトタイトル",
  description: "サイトの説明文（120〜160文字推奨）",
};
```

### 動的メタデータ（generateMetadata）

```tsx
import type { Metadata } from "next";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.slug);

  return {
    title: article.title,
    description: article.excerpt,
  };
}
```

## OGP設定

### 基本OGP

```tsx
export const metadata: Metadata = {
  title: "ページタイトル",
  description: "ページの説明",
  openGraph: {
    title: "OGP用タイトル",
    description: "OGP用説明文",
    url: "https://example.com/page",
    siteName: "サイト名",
    images: [
      {
        url: "https://example.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "OGP画像の説明",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
};
```

### 記事ページ用OGP

```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.slug);
  const ogImageUrl = article.thumbnail || "/default-og.png";

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `https://example.com/articles/${params.slug}`,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
  };
}
```

## Twitter Card

```tsx
export const metadata: Metadata = {
  twitter: {
    card: "summary_large_image",
    title: "タイトル",
    description: "説明文",
    images: ["https://example.com/twitter-image.png"],
    creator: "@username",
    site: "@sitename",
  },
};
```

## 構造化データ（JSON-LD）

### Article スキーマ

```tsx
// app/articles/[slug]/page.tsx
import { Article, WithContext } from "schema-dts";

export default async function ArticlePage({ params }: Props) {
  const article = await getArticle(params.slug);

  const jsonLd: WithContext<Article> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.thumbnail,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Person",
      name: article.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "サイト名",
      logo: {
        "@type": "ImageObject",
        url: "https://example.com/logo.png",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleContent article={article} />
    </>
  );
}
```

### BreadcrumbList スキーマ

```tsx
import { BreadcrumbList, WithContext } from "schema-dts";

function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const jsonLd: WithContext<BreadcrumbList> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

### WebSite スキーマ（トップページ）

```tsx
import { WebSite, WithContext } from "schema-dts";

const websiteJsonLd: WithContext<WebSite> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "サイト名",
  url: "https://example.com",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://example.com/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};
```

## ページ別設定パターン

### トップページ

```tsx
// app/page.tsx
export const metadata: Metadata = {
  title: "サイト名 | キャッチフレーズ",
  description: "サイトの説明（120〜160文字）",
  openGraph: {
    type: "website",
    // ...
  },
};
```

### カテゴリ一覧

```tsx
// app/categories/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategory(params.slug);

  return {
    title: `${category.name}の記事一覧`,
    description: `${category.name}に関する記事の一覧ページです。`,
    openGraph: {
      type: "website",
      // ...
    },
  };
}
```

### 記事詳細

```tsx
// app/articles/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.slug);

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      type: "article",
      publishedTime: article.publishedAt,
      // ...
    },
  };
}
```

## 共通設定（layout.tsx）

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "サイト名",
    template: "%s | サイト名",
  },
  description: "デフォルトの説明文",
  keywords: ["キーワード1", "キーワード2"],
  authors: [{ name: "著者名" }],
  creator: "作成者",
  publisher: "発行者",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};
```

## チェックリスト

### 必須項目

- [ ] `title` が設定されているか（50〜60文字推奨）
- [ ] `description` が設定されているか（120〜160文字推奨）
- [ ] `metadataBase` がルートlayout.tsxで設定されているか

### OGP

- [ ] `og:title` が設定されているか
- [ ] `og:description` が設定されているか
- [ ] `og:image` が設定されているか（1200x630px推奨）
- [ ] `og:url` が正しいか
- [ ] `og:type` が適切か（website/article）

### Twitter Card

- [ ] `twitter:card` が設定されているか
- [ ] `twitter:image` が設定されているか

### 構造化データ

- [ ] 記事ページに Article スキーマがあるか
- [ ] パンくずに BreadcrumbList スキーマがあるか
- [ ] JSON-LD が正しいフォーマットか

## 検証ツール

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Schema.org Validator](https://validator.schema.org/)

## 依存パッケージ

```bash
npm install schema-dts
```

`schema-dts` は TypeScript の型定義を提供し、JSON-LD の型安全な記述を可能にする。
