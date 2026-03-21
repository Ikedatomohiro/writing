import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticlesByCategory, getLatestArticles } from "@/lib/content/api";
import { isValidCategory, type Category } from "@/lib/content/types";
import { BlogArticleCard } from "@/components/blog/BlogArticleCard/BlogArticleCard";
import { Sidebar } from "@/components/layout/Sidebar/Sidebar";
import { PopularArticles } from "@/components/layout/Sidebar/PopularArticles";
import { NewsletterSignup } from "@/components/layout/Sidebar/NewsletterSignup";
import { AdSlot } from "@/components/layout/Sidebar/AdSlot";
import { CATEGORY_META } from "@/lib/constants/site";

const CATEGORY_TITLES: Record<Category, string> = {
  asset: CATEGORY_META.asset.title,
  tech: CATEGORY_META.tech.title,
  health: CATEGORY_META.health.title,
};

const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  asset: CATEGORY_META.asset.description,
  tech: CATEGORY_META.tech.description,
  health: CATEGORY_META.health.description,
};

const CATEGORY_SUBTITLES: Record<Category, string> = {
  asset: "The Capital Daily",
  tech: "Code & Craft",
  health: "Wellness Journal",
};

const TECH_PILLS = ["Frontend", "Backend", "DevOps", "AI"];

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categories: Category[] = ["asset", "tech", "health"];
  return categories.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;

  if (!isValidCategory(category)) {
    return {};
  }

  const title = CATEGORY_TITLES[category];
  const description = CATEGORY_DESCRIPTIONS[category];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `/${category}`,
    },
    alternates: {
      canonical: `/${category}`,
    },
  };
}

function CategoryHeader({ category }: { category: Category }) {
  const title = CATEGORY_TITLES[category];
  const subtitle = CATEGORY_SUBTITLES[category];

  return (
    <header className="mb-12">
      <p className="text-primary font-label text-xs font-bold tracking-widest uppercase mb-2">
        {subtitle}
      </p>
      <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface leading-tight mb-3">
        {title}
      </h1>
      <p className="text-on-surface-variant text-base leading-relaxed max-w-2xl">
        {CATEGORY_DESCRIPTIONS[category]}
      </p>
      {category === "tech" && <TechCategoryPills />}
      <div className="mt-6 h-px bg-outline-variant" />
    </header>
  );
}

function TechCategoryPills() {
  return (
    <div className="flex gap-2 mt-4" data-testid="tech-pills">
      {TECH_PILLS.map((pill) => (
        <span
          key={pill}
          className="px-3 py-1 text-xs font-label font-bold tracking-wider rounded-full bg-surface-container-high text-on-surface-variant"
        >
          {pill}
        </span>
      ))}
    </div>
  );
}

function FeaturedArticle({
  article,
}: {
  article: Parameters<typeof BlogArticleCard>[0]["article"];
}) {
  return (
    <section className="mb-12" data-testid="featured-article">
      <BlogArticleCard article={article} variant="large" />
    </section>
  );
}

function ArticleGrid({
  articles,
}: {
  articles: Parameters<typeof BlogArticleCard>[0]["article"][];
}) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
      data-testid="article-grid"
    >
      {articles.map((article) => (
        <BlogArticleCard key={article.slug} article={article} />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="py-12 text-center bg-surface-container-low rounded-xl"
      data-testid="empty-state"
    >
      <p className="text-on-surface-variant">まだ記事がありません。</p>
    </div>
  );
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  if (!isValidCategory(category)) {
    notFound();
    return null;
  }

  const [articles, latestArticles] = await Promise.all([
    getArticlesByCategory(category),
    getLatestArticles(5),
  ]);

  // ArticleMeta を PopularArticle に変換
  const popularArticles = latestArticles.map((article) => ({
    id: article.slug,
    title: article.title,
    href: `/${article.category}/${article.slug}`,
  }));

  const featuredArticle = articles[0];
  const remainingArticles = articles.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex gap-10">
        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <CategoryHeader category={category} />

          {articles.length > 0 ? (
            <>
              <FeaturedArticle article={featuredArticle} />
              {remainingArticles.length > 0 && (
                <ArticleGrid articles={remainingArticles} />
              )}
            </>
          ) : (
            <EmptyState />
          )}
        </main>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <Sidebar>
            <PopularArticles articles={popularArticles} />
            <NewsletterSignup />
            <AdSlot size="rectangle" showPlaceholder />
          </Sidebar>
        </div>
      </div>
    </div>
  );
}
