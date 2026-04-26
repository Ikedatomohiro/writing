import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { Category } from "@/lib/content/types";
import { isPublicCategory } from "@/lib/content/types";
import { getArticleBySlug } from "@/lib/content/api";
import { compileMDXContent } from "@/lib/content/mdx";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { AuthorByline } from "@/components/blog/AuthorByline";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { ShareButtonGroup } from "@/components/ui/ShareButton";
import { Ad } from "@/components/ui/Ad";
import { TableOfContentsContainer } from "@/components/layout/Sidebar";
import { ARTICLE_BODY_SELECTOR } from "@/lib/constants/styles";
import { SITE_CONFIG, AUTHOR_CONFIG, CATEGORY_META } from "@/lib/constants/site";
import { generateArticleJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo/jsonld";

interface ArticleDetailPageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

/**
 * 日付を日本語形式でフォーマット
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * カテゴリの日本語名を取得
 */
function getCategoryLabel(category: Category): string {
  const labels: Record<Category, string> = {
    asset: "資産形成",
    tech: "プログラミング",
    health: "健康",
  };
  return labels[category];
}

/**
 * 記事詳細ページ
 */
export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { category, slug } = await params;

  if (!isPublicCategory(category)) {
    notFound();
  }

  const article = await getArticleBySlug(category as Category, slug);

  if (!article) {
    notFound();
  }

  const { content } = await compileMDXContent(article.content);

  const articleUrl = `/${article.category}/${article.slug}`;
  const fullUrl = `${SITE_CONFIG.url}${articleUrl}`;
  const imageUrl = article.thumbnail
    ? article.thumbnail.startsWith("http")
      ? article.thumbnail
      : `${SITE_CONFIG.url}${article.thumbnail}`
    : undefined;

  const articleJsonLd = generateArticleJsonLd({
    title: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.updatedAt,
    url: fullUrl,
    image: imageUrl,
    authorName: AUTHOR_CONFIG.name,
    authorUrl: `${SITE_CONFIG.url}${AUTHOR_CONFIG.url}`,
    authorJobTitle: AUTHOR_CONFIG.jobTitle,
  });

  const categoryMeta = CATEGORY_META[article.category];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "ホーム", url: SITE_CONFIG.url },
    { name: categoryMeta.title, url: `${SITE_CONFIG.url}/${article.category}` },
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

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-8 pb-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 font-label text-on-surface-variant font-medium tracking-wide uppercase text-sm">
          <Link
            href="/"
            className="hover:text-primary transition-colors"
          >
            ホーム
          </Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <Link
            href={`/${article.category}`}
            className="hover:text-primary transition-colors"
          >
            {getCategoryLabel(article.category)}
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Article Content Column */}
          <article className="lg:col-span-8">
            <header className="mb-12">
              <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface leading-[1.1] tracking-tight mb-8">
                {article.title}
              </h1>

              <div className="flex items-center gap-6 py-6 border-y border-outline-variant/20">
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-headline font-bold text-lg">
                  {AUTHOR_CONFIG.name[0]}
                </div>
                <div className="flex flex-col gap-1">
                  <AuthorByline
                    name={AUTHOR_CONFIG.name}
                    href={AUTHOR_CONFIG.url}
                  />
                  <span className="text-sm text-on-surface-variant">
                    {formatDate(article.date)}
                    {article.updatedAt && ` (更新: ${formatDate(article.updatedAt)})`}
                  </span>
                </div>

                <div className="ml-auto">
                  <ShareButtonGroup url={articleUrl} title={article.title} />
                </div>
              </div>
            </header>

            {/* Hero Image */}
            {article.thumbnail && (
              <div className="w-full aspect-video mb-12 overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.thumbnail}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* 広告（記事上部） */}
            <Ad variant="leaderboard" />

            {/* 記事本文 */}
            <ArticleBody>{content}</ArticleBody>

            {/* 広告（記事下部） */}
            <div className="mt-12">
              <Ad variant="leaderboard" />
            </div>

            {/* シェアボタン */}
            <div className="py-8 mt-8 border-t border-outline-variant/20">
              <p className="text-sm font-label font-medium mb-4 text-on-surface-variant">
                この記事をシェアする
              </p>
              <ShareButtonGroup url={articleUrl} title={article.title} />
            </div>

            {/* 関連記事 */}
            <RelatedArticles
              category={article.category}
              currentSlug={article.slug}
              limit={3}
            />
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block lg:col-span-4 space-y-10">
            <div className="sticky top-28">
              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
                <TableOfContentsContainer contentSelector={ARTICLE_BODY_SELECTOR} />
              </div>

              {/* Newsletter CTA */}
              <div className="bg-gradient-to-br from-primary to-primary-container text-on-primary p-8 rounded-xl relative overflow-hidden mt-10">
                <div className="relative z-10">
                  <h4 className="text-2xl font-headline font-bold mb-4 tracking-tight">
                    ニュースレター
                  </h4>
                  <p className="text-on-primary/80 text-sm mb-6 leading-relaxed">
                    最新記事をメールでお届けします。
                  </p>
                  <input type="email" placeholder="your@email.com" className="w-full bg-on-primary/10 border-0 rounded-lg py-3 px-4 text-sm text-on-primary placeholder:text-on-primary/40 focus:outline-none focus:ring-2 focus:ring-on-primary/30 mb-3" />
                  <button className="w-full bg-surface-container-lowest text-primary font-bold py-3 rounded-lg hover:bg-surface-container-lowest/90 transition-colors text-sm">登録する</button>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

/**
 * 動的レンダリング（Vercel Blobから記事を読み込むため、SSGではなくSSR）
 * 新しい記事がBlobに追加されたとき、再デプロイなしで表示される
 */
export const dynamicParams = true;
export const dynamic = "force-dynamic";

/**
 * メタデータ生成
 */
export async function generateMetadata({
  params,
}: ArticleDetailPageProps): Promise<Metadata> {
  const { category, slug } = await params;

  if (!isPublicCategory(category)) {
    return {
      title: "記事が見つかりません",
    };
  }

  const article = await getArticleBySlug(category as Category, slug);

  if (!article) {
    return {
      title: "記事が見つかりません",
    };
  }

  const url = `/${category}/${slug}`;
  const fullUrl = `${SITE_CONFIG.url}${url}`;
  const ogImageUrl = `${SITE_CONFIG.url}/api/og?title=${encodeURIComponent(article.title)}&category=${encodeURIComponent(category)}`;
  const imageUrl = article.thumbnail
    ? article.thumbnail.startsWith("http")
      ? article.thumbnail
      : `${SITE_CONFIG.url}${article.thumbnail}`
    : ogImageUrl;

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      url: fullUrl,
      publishedTime: article.date,
      modifiedTime: article.updatedAt,
      images: [imageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
    },
  };
}
