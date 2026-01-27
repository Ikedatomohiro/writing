/**
 * JSON-LD構造化データ生成ヘルパー
 */

export interface ArticleJsonLdProps {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  url: string;
  image?: string;
  authorName: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface ArticleJsonLd {
  "@context": string;
  "@type": string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  url: string;
  image?: string;
  author: {
    "@type": string;
    name: string;
  };
}

interface BreadcrumbListItem {
  "@type": string;
  position: number;
  name: string;
  item: string;
}

interface BreadcrumbJsonLd {
  "@context": string;
  "@type": string;
  itemListElement: BreadcrumbListItem[];
}

/**
 * Article スキーマのJSON-LDを生成
 */
export function generateArticleJsonLd(
  props: ArticleJsonLdProps
): ArticleJsonLd {
  const jsonLd: ArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: props.title,
    description: props.description,
    datePublished: props.datePublished,
    url: props.url,
    author: {
      "@type": "Person",
      name: props.authorName,
    },
  };

  if (props.dateModified) {
    jsonLd.dateModified = props.dateModified;
  }

  if (props.image) {
    jsonLd.image = props.image;
  }

  return jsonLd;
}

/**
 * BreadcrumbList スキーマのJSON-LDを生成
 */
export function generateBreadcrumbJsonLd(
  items: BreadcrumbItem[]
): BreadcrumbJsonLd {
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
