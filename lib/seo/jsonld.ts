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
  authorUrl?: string;
  authorJobTitle?: string;
  /**
   * 著者の同一性を示す外部URL一覧（schema.org `sameAs`）。
   * E-E-A-Tシグナル強化のため、Threads / X等のSNSプロフィールを指定する。
   */
  authorSameAs?: string[];
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
    url?: string;
    jobTitle?: string;
    sameAs?: string[];
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
  const author: ArticleJsonLd["author"] = {
    "@type": "Person",
    name: props.authorName,
  };

  if (props.authorUrl) {
    author.url = props.authorUrl;
  }

  if (props.authorJobTitle) {
    author.jobTitle = props.authorJobTitle;
  }

  if (props.authorSameAs && props.authorSameAs.length > 0) {
    author.sameAs = props.authorSameAs;
  }

  const jsonLd: ArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: props.title,
    description: props.description,
    datePublished: props.datePublished,
    url: props.url,
    author,
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
 * JSON-LDを `<script>` タグへ安全に埋め込むための文字列にシリアライズする。
 * `<` を `<` にエスケープし、本文中の `</script>` によるHTMLブレイクアウト（XSS）を防ぐ。
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
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
