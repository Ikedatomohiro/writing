import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticlesByCategory, getLatestArticles } from "@/lib/content/api";
import { isValidCategory, type Category } from "@/lib/content/types";
import type { ArticleMeta } from "@/lib/content/types";
import { BlogArticleCard } from "@/components/blog/BlogArticleCard/BlogArticleCard";
import { Sidebar } from "@/components/layout/Sidebar/Sidebar";
import { PopularArticles } from "@/components/layout/Sidebar/PopularArticles";
import { NewsletterSignup } from "@/components/layout/Sidebar/NewsletterSignup";
import { AdSlot } from "@/components/layout/Sidebar/AdSlot";
import { CATEGORY_META } from "@/lib/constants/site";
import Link from "next/link";
import Image from "next/image";

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

const CATEGORY_PILLS: Record<Category, string[]> = {
  health: ["Nutrition", "Fitness", "Mindset", "Sleep", "Wellness"],
  asset: ["Markets", "Retirement", "Savings", "Taxes", "Crypto"],
  tech: ["Frontend", "Backend", "DevOps", "AI"],
};

function getDataTheme(category: Category): string {
  return category === "tech" ? "programming" : category;
}

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

function CategoryPills({ category }: { category: Category }) {
  const pills = CATEGORY_PILLS[category];
  return (
    <div className="flex flex-wrap gap-2 mt-4" data-testid="category-pills">
      {pills.map((pill, index) => (
        <span
          key={pill}
          className={
            index === 0
              ? "bg-primary text-on-primary px-4 py-1 rounded-full text-sm font-semibold"
              : "bg-surface-container-high text-on-surface-variant px-4 py-1 rounded-full text-sm font-medium hover:bg-surface-container-highest transition-colors"
          }
        >
          {pill}
        </span>
      ))}
    </div>
  );
}

function CategoryHeader({ category }: { category: Category }) {
  const title = CATEGORY_TITLES[category];
  const subtitle = CATEGORY_SUBTITLES[category];

  return (
    <header className="mb-12">
      <p className="text-primary font-label text-xs font-bold tracking-widest uppercase mb-2">
        {subtitle}
      </p>
      <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-on-surface tracking-tighter leading-none mb-3">
        {title}
      </h1>
      <p className="text-on-surface-variant text-base leading-relaxed max-w-2xl">
        {CATEGORY_DESCRIPTIONS[category]}
      </p>
      <CategoryPills category={category} />
      <div className="mt-6 h-px bg-outline-variant" />
    </header>
  );
}

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split("-");
  return `${year}.${month}.${day}`;
}

function TechGlassCard({
  article,
  isFirst,
}: {
  article: ArticleMeta;
  isFirst: boolean;
}) {
  const href = `/${article.category}/${article.slug}`;

  return (
    <Link
      href={href}
      className={`block group ${isFirst ? "md:col-span-2" : ""}`}
    >
      <article className="glass-card neo-glow rounded-xl overflow-hidden h-full flex flex-col transition-all duration-500">
        <div className="aspect-[16/9] overflow-hidden bg-surface-container relative">
          {article.thumbnail ? (
            <Image
              src={article.thumbnail}
              alt={article.title}
              fill
              className="object-cover grayscale hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-surface-container grayscale hover:grayscale-0 transition-all duration-500" />
          )}
        </div>
        <div className="p-6 flex-1">
          <span className="font-mono text-primary font-label text-xs font-bold tracking-widest uppercase">
            {article.category}
          </span>
          <h3 className="text-lg font-headline font-extrabold leading-tight mb-2 mt-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-fixed">
            {article.title}
          </h3>
          {article.description && (
            <p className="text-on-surface-variant text-sm line-clamp-2">
              {article.description}
            </p>
          )}
          <div className="mt-auto pt-4">
            <span className="text-on-surface-variant font-label text-xs">
              {formatDate(article.date)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function TechBentoGrid({ articles }: { articles: ArticleMeta[] }) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
      data-testid="tech-bento-grid"
    >
      {articles.map((article, index) => (
        <TechGlassCard
          key={article.slug}
          article={article}
          isFirst={index === 0}
        />
      ))}
    </div>
  );
}

function FeaturedArticle({
  article,
}: {
  article: ArticleMeta;
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
  articles: ArticleMeta[];
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

function ArticleContent({
  category,
  articles,
}: {
  category: Category;
  articles: ArticleMeta[];
}) {
  if (articles.length === 0) {
    return <EmptyState />;
  }

  if (category === "tech") {
    return <TechBentoGrid articles={articles} />;
  }

  const featuredArticle = articles[0];
  const remainingArticles = articles.slice(1);

  return (
    <>
      <FeaturedArticle article={featuredArticle} />
      {remainingArticles.length > 0 && (
        <ArticleGrid articles={remainingArticles} />
      )}
    </>
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

  const popularArticles = latestArticles.map((article) => ({
    id: article.slug,
    title: article.title,
    href: `/${article.category}/${article.slug}`,
  }));

  return (
    <div
      data-theme={getDataTheme(category)}
      data-testid="category-theme-container"
      className="max-w-7xl mx-auto px-6 py-10"
    >
      <div
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        data-testid="category-grid"
      >
        {/* Main Content */}
        <main className="lg:col-span-8 min-w-0">
          <CategoryHeader category={category} />
          <ArticleContent category={category} articles={articles} />
        </main>

        {/* Sidebar */}
        <div
          className="hidden lg:block lg:col-span-4"
          data-testid="sidebar-wrapper"
        >
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
