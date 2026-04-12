import type { Metadata } from "next";
import Link from "next/link";
import { BlogArticleCard } from "@/components/blog/BlogArticleCard/BlogArticleCard";
import { getArticlesByCategory } from "@/lib/content/api";
import type { Category, ArticleMeta } from "@/lib/content/types";
import { SITE_CONFIG, CATEGORIES } from "@/lib/constants/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: SITE_CONFIG.name,
  description: SITE_CONFIG.description,
  openGraph: {
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    type: "website",
    url: "/",
  },
  alternates: {
    canonical: "/",
  },
};

const CATEGORY_CONFIG = CATEGORIES.map(({ slug, label, href }) => ({
  category: slug as Category,
  label,
  href,
}));

function HeroSection({ article }: { article: ArticleMeta }) {
  const href = `/${article.category}/${article.slug}`;
  const thumbnailSrc = article.thumbnail || SITE_CONFIG.defaultOgImage;

  return (
    <section className="mb-20" data-testid="hero-section">
      <div className="relative grid md:grid-cols-12 gap-0 items-center">
        <div className="md:col-span-7 z-10">
          <div className="bg-surface-container-lowest p-8 md:p-16 rounded-xl shadow-2xl shadow-on-surface/5 backdrop-blur-sm">
            <span className="text-primary font-label text-xs font-bold tracking-widest uppercase mb-4 block">
              注目の記事
            </span>
            <h1 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tighter text-on-surface leading-tight mb-6">
              {article.title}
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-8 max-w-lg">
              {article.description}
            </p>
            <div className="flex items-center gap-4">
              <Link
                href={href}
                className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
              >
                記事を読む
              </Link>
            </div>
          </div>
        </div>
        <div className="md:col-span-5 mt-8 md:mt-0">
          <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-xl bg-surface-container-high">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailSrc}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryNavigation() {
  return (
    <div className="flex flex-wrap items-center gap-6 mb-12 border-b border-outline-variant/20 pb-6">
      <span className="text-outline font-label text-[10px] tracking-[0.2em] uppercase font-bold">
        カテゴリ
      </span>
      {CATEGORY_CONFIG.map(({ category, label, href }) => (
        <Link
          key={category}
          href={href}
          className="text-on-surface-variant font-headline font-bold text-lg hover:text-primary transition-colors"
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

function BentoGrid({ articles, hasMore }: { articles: ArticleMeta[]; hasMore: boolean }) {
  const [first, second, ...rest] = articles;

  return (
    <section>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
        {/* Large Card - spans 2 columns */}
        {first && (
          <div className="col-span-2 md:col-span-2">
            <BlogArticleCard article={first} variant="large" />
          </div>
        )}

        {/* Square Card */}
        {second && (
          <div>
            <BlogArticleCard article={second} variant="square" />
          </div>
        )}

        {/* Standard Cards */}
        {rest.map((article) => (
          <div key={article.slug}>
            <BlogArticleCard article={article} variant="default" />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-12 text-center">
          <Link
            href="/tech"
            className="inline-flex px-8 py-3 border border-outline-variant text-on-surface-variant rounded-full font-headline font-bold hover:bg-surface-container transition-colors"
          >
            すべての記事を見る
          </Link>
        </div>
      )}
    </section>
  );
}

function NewsletterSection() {
  return (
    <section className="mt-24 bg-surface-container-lowest rounded-xl p-12 md:p-20 text-center border border-outline-variant/10">
      <h2 className="text-3xl md:text-5xl font-headline font-extrabold tracking-tighter text-on-surface mb-6">
        厳選された知見を、
        <br />
        毎週お届け。
      </h2>
      <p className="text-on-surface-variant text-lg mb-10 max-w-xl mx-auto">
        最新の記事や厳選されたコンテンツを毎週お届けします。
      </p>
      <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
        <input
          className="flex-1 bg-surface-container border-none rounded-full px-6 py-4 focus:ring-2 focus:ring-primary/20 text-on-surface"
          placeholder="メールアドレス"
          type="email"
        />
        <button
          className="bg-primary text-on-primary px-10 py-4 rounded-full font-bold shadow-lg hover:bg-primary-container transition-all"
          type="submit"
        >
          登録
        </button>
      </form>
      <p className="mt-6 text-outline text-[10px] uppercase tracking-widest font-label">
        スパムはありません。厳選された情報のみ。
      </p>
    </section>
  );
}

export default async function Home() {
  // Fetch articles for public categories only
  const techArticles = await getArticlesByCategory("tech");

  // Sort by date for the bento grid
  const allArticles = [...techArticles]
    .sort((a, b) => {
      const aTime = new Date(a.registeredAt ?? a.date).getTime();
      const bTime = new Date(b.registeredAt ?? b.date).getTime();
      return bTime - aTime;
    });

  // First article is the hero, rest go in the bento grid (max 9 total: 1 hero + 8 grid)
  const MAX_DISPLAY = 9;
  const hasMore = allArticles.length > MAX_DISPLAY;
  const displayedArticles = allArticles.slice(0, MAX_DISPLAY);
  const [featuredArticle, ...gridArticles] = displayedArticles;

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* Hero Section: Content Spotlight */}
      {featuredArticle && <HeroSection article={featuredArticle} />}

      {/* Category Navigation */}
      <CategoryNavigation />

      {/* Bento Grid Article List */}
      {gridArticles.length > 0 && <BentoGrid articles={gridArticles} hasMore={hasMore} />}

      {/* Newsletter CTA */}
      <NewsletterSection />
    </div>
  );
}
