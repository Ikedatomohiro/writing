import Link from "next/link";

export interface PopularArticle {
  id: string;
  title: string;
  href: string;
}

export interface PopularArticlesProps {
  articles: PopularArticle[];
  title?: string;
  limit?: number;
}

export function PopularArticles({
  articles,
  title = "人気記事",
  limit = 5,
}: PopularArticlesProps) {
  const displayedArticles = articles.slice(0, limit);

  return (
    <section
      role="region"
      data-testid="popular-articles"
      aria-label={title}
      className="bg-surface-container-low rounded-xl border border-outline-variant p-5"
    >
      <h3 className="font-body text-base font-semibold text-on-surface mb-4">
        {title}
      </h3>
      <div className="flex flex-col gap-4">
        {displayedArticles.map((article, index) => (
          <div key={article.id} className="flex gap-2">
            <span className="font-body text-sm text-on-surface-variant shrink-0">
              {index + 1}.
            </span>
            <Link
              href={article.href}
              className="font-body text-sm text-on-surface-variant leading-relaxed no-underline hover:text-primary transition-colors"
            >
              {article.title}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
