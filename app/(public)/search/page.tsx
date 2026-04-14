import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles } from "@/lib/content/api";
import type { ArticleMeta, Category } from "@/lib/content/types";
import { SITE_CONFIG, CATEGORIES, HIDDEN_CATEGORIES } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: `Search - ${SITE_CONFIG.name}`,
  description: "Search articles across all categories.",
};

const ITEMS_PER_PAGE = 10;

const CATEGORY_BADGE_STYLES: Record<Category, string> = {
  health: "text-primary bg-primary-fixed",
  tech: "text-tertiary bg-tertiary-fixed",
  asset: "text-secondary bg-secondary-fixed",
};

const CATEGORY_LABELS: Record<Category, string> = {
  health: "Health",
  tech: "Tech",
  asset: "Finance",
};

const FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: "すべて", value: "all" },
  ...CATEGORIES.map((c) => ({ label: c.label, value: c.slug })),
];

function filterArticles(
  articles: ArticleMeta[],
  query: string,
  category: string
): ArticleMeta[] {
  let filtered = articles.filter(
    (article) => !HIDDEN_CATEGORIES.has(article.category)
  );

  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(
      (article) =>
        article.title.toLowerCase().includes(lowerQuery) ||
        article.description.toLowerCase().includes(lowerQuery) ||
        article.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  if (category && category !== "all") {
    filtered = filtered.filter((article) => article.category === category);
  }

  return filtered;
}

function buildPageUrl(query: string, category: string, page: number): string {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (category && category !== "all") params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}

function SearchHeader({
  query,
  totalResults,
}: {
  query: string;
  totalResults: number;
}) {
  return (
    <header className="mb-12">
      <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-4">
        記事を検索
      </h1>
      <form method="get" action="/search" className="mb-4">
        <div className="relative max-w-xl">
          <span
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-lg"
          >
            search
          </span>
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="キーワードを入力..."
            className="w-full pl-10 pr-4 py-3 bg-surface-container border border-outline-variant/30 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </form>
      {query ? (
        <p className="font-body text-on-surface-variant">
          <span className="font-bold text-primary">&apos;{query}&apos;</span> の検索結果: {totalResults}件
        </p>
      ) : (
        <p className="font-body text-on-surface-variant">
          全 {totalResults} 件の記事
        </p>
      )}
    </header>
  );
}

function FilterChips({
  activeCategory,
  query,
}: {
  activeCategory: string;
  query: string;
}) {
  return (
    <div className="flex flex-wrap gap-3 mb-10">
      {FILTER_OPTIONS.map((option) => {
        const isActive = activeCategory === option.value;
        const href = buildPageUrl(query, option.value, 1);
        return (
          <Link
            key={option.value}
            href={href}
            className={`px-5 py-2 rounded-full font-label text-xs font-semibold tracking-wider uppercase transition-colors ${
              isActive
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}

function ResultItem({ article }: { article: ArticleMeta }) {
  const badgeStyle =
    CATEGORY_BADGE_STYLES[article.category] ?? "text-primary bg-primary-fixed";
  const categoryLabel =
    CATEGORY_LABELS[article.category] ?? article.category;

  return (
    <article className="p-8 bg-surface-container-lowest hover:bg-surface-container transition-colors duration-300 group cursor-pointer border-b border-outline-variant/10">
      <Link
        href={`/${article.category}/${article.slug}`}
        className="flex flex-col md:flex-row gap-8 items-start"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span
              className={`font-label text-[10px] tracking-[0.15em] uppercase font-bold ${badgeStyle} px-2 py-0.5 rounded`}
            >
              {categoryLabel}
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant" />
            <time className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant">
              {new Date(article.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
          <h2 className="font-headline text-2xl font-bold mb-3 text-on-surface group-hover:text-primary transition-colors leading-tight">
            {article.title}
          </h2>
          <p className="font-body text-on-surface-variant line-clamp-2 mb-4 leading-relaxed max-w-2xl">
            {article.description}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            </div>
            <span className="font-label text-xs font-medium text-on-surface">
              {SITE_CONFIG.name}
            </span>
          </div>
        </div>
        <div className="w-full md:w-48 h-32 rounded-lg bg-surface-container-highest overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={article.title}
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
            src={article.thumbnail || SITE_CONFIG.defaultOgImage}
          />
        </div>
      </Link>
    </article>
  );
}

function Pagination({
  currentPage,
  totalPages,
  query,
  category,
}: {
  currentPage: number;
  totalPages: number;
  query: string;
  category: string;
}) {
  if (totalPages <= 1) return null;

  const pages = generatePageNumbers(currentPage, totalPages);

  return (
    <div className="mt-16 flex items-center justify-center gap-2">
      {currentPage > 1 && (
        <Link
          href={buildPageUrl(query, category, currentPage - 1)}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant"
          aria-label="Previous page"
        >
          <span className="material-symbols-outlined text-sm">chevron_left</span>
        </Link>
      )}
      {pages.map((page, index) =>
        page === "..." ? (
          <span key={`ellipsis-${index}`} className="px-2 text-on-surface-variant">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={buildPageUrl(query, category, page as number)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
              page === currentPage
                ? "bg-primary text-on-primary font-bold"
                : "hover:bg-surface-container"
            }`}
          >
            {page}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link
          href={buildPageUrl(query, category, currentPage + 1)}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant"
          aria-label="Next page"
        >
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </Link>
      )}
    </div>
  );
}

function generatePageNumbers(
  current: number,
  total: number
): (number | "...")[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) {
    pages.push("...");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("...");
  }

  pages.push(total);
  return pages;
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="text-center py-20">
      <p className="font-headline text-2xl font-bold text-on-surface mb-4">
        No results found
      </p>
      <p className="font-body text-on-surface-variant">
        {query
          ? `We couldn't find any articles matching "${query}". Try adjusting your search terms.`
          : "No articles available at this time."}
      </p>
    </div>
  );
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q ?? "";
  const category = params.category ?? "all";
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const allArticles = await getAllArticles();
  const filteredArticles = filterArticles(allArticles, query, category);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const pageArticles = filteredArticles.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <main className="pt-32 pb-20 px-6 max-w-5xl mx-auto min-h-screen bg-surface font-body text-on-surface">
      <SearchHeader query={query} totalResults={filteredArticles.length} />
      <FilterChips activeCategory={category} query={query} />

      {pageArticles.length > 0 ? (
        <div className="space-y-1 bg-surface-container-low rounded-xl overflow-hidden shadow-sm">
          {pageArticles.map((article) => (
            <ResultItem key={`${article.category}-${article.slug}`} article={article} />
          ))}
        </div>
      ) : (
        <EmptyState query={query} />
      )}

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        query={query}
        category={category}
      />
    </main>
  );
}
