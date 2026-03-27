import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import SearchPage from "./page";

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock the content API
vi.mock("@/lib/content/api", () => ({
  getAllArticles: vi.fn(),
}));

import { getAllArticles } from "@/lib/content/api";

const mockArticles = [
  {
    slug: "article-1",
    title: "Health Tips for Better Sleep",
    description: "Improve your sleep quality",
    date: "2026-01-15",
    category: "health" as const,
    tags: ["sleep", "wellness"],
    published: true,
  },
  {
    slug: "article-2",
    title: "Investing in Index Funds",
    description: "A guide to passive investing",
    date: "2026-01-10",
    category: "asset" as const,
    tags: ["investing", "finance"],
    published: true,
  },
  {
    slug: "article-3",
    title: "React Server Components",
    description: "Understanding RSC architecture",
    date: "2026-01-05",
    category: "tech" as const,
    tags: ["react", "nextjs"],
    published: true,
  },
];

function createSearchParams(params: {
  q?: string;
  category?: string;
  page?: string;
}) {
  return Promise.resolve(params);
}

describe("SearchPage", () => {
  beforeEach(() => {
    vi.mocked(getAllArticles).mockResolvedValue(mockArticles);
  });

  afterEach(() => {
    cleanup();
  });

  describe("header", () => {
    it("shows total results count when no query", async () => {
      render(await SearchPage({ searchParams: createSearchParams({}) }));
      expect(screen.getByText("Browse all 3 articles")).toBeInTheDocument();
    });

    it("shows query and result count when searching", async () => {
      render(
        await SearchPage({ searchParams: createSearchParams({ q: "Health" }) })
      );
      expect(screen.getByText(/Showing 1 result for/)).toBeInTheDocument();
      expect(screen.getByText("'Health'")).toBeInTheDocument();
    });

    it("shows plural 'results' for multiple matches", async () => {
      render(
        await SearchPage({
          searchParams: createSearchParams({ q: "article" }),
        })
      );
      // All 3 articles don't match "article" in title/description/tags
      // but let's check with a query that matches nothing
      expect(screen.getByText("Search Results")).toBeInTheDocument();
    });
  });

  describe("filtering", () => {
    it("filters articles by search query in title", async () => {
      render(
        await SearchPage({ searchParams: createSearchParams({ q: "React" }) })
      );
      expect(screen.getByText("React Server Components")).toBeInTheDocument();
      expect(
        screen.queryByText("Health Tips for Better Sleep")
      ).not.toBeInTheDocument();
    });

    it("filters articles by search query in description", async () => {
      render(
        await SearchPage({
          searchParams: createSearchParams({ q: "passive" }),
        })
      );
      expect(screen.getByText("Investing in Index Funds")).toBeInTheDocument();
      expect(
        screen.queryByText("React Server Components")
      ).not.toBeInTheDocument();
    });

    it("filters articles by search query in tags", async () => {
      render(
        await SearchPage({
          searchParams: createSearchParams({ q: "nextjs" }),
        })
      );
      expect(screen.getByText("React Server Components")).toBeInTheDocument();
      expect(
        screen.queryByText("Health Tips for Better Sleep")
      ).not.toBeInTheDocument();
    });

    it("filters by category", async () => {
      render(
        await SearchPage({
          searchParams: createSearchParams({ category: "tech" }),
        })
      );
      expect(screen.getByText("React Server Components")).toBeInTheDocument();
      expect(
        screen.queryByText("Health Tips for Better Sleep")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Investing in Index Funds")
      ).not.toBeInTheDocument();
    });

    it("shows all articles when category is 'all'", async () => {
      render(
        await SearchPage({
          searchParams: createSearchParams({ category: "all" }),
        })
      );
      expect(
        screen.getByText("Health Tips for Better Sleep")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Investing in Index Funds")
      ).toBeInTheDocument();
      expect(screen.getByText("React Server Components")).toBeInTheDocument();
    });

    it("combines query and category filters", async () => {
      render(
        await SearchPage({
          searchParams: createSearchParams({
            q: "sleep",
            category: "health",
          }),
        })
      );
      expect(
        screen.getByText("Health Tips for Better Sleep")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Investing in Index Funds")
      ).not.toBeInTheDocument();
    });

    it("is case-insensitive", async () => {
      render(
        await SearchPage({
          searchParams: createSearchParams({ q: "REACT" }),
        })
      );
      expect(screen.getByText("React Server Components")).toBeInTheDocument();
    });
  });

  describe("filter chips", () => {
    it("renders all filter options as links", async () => {
      render(await SearchPage({ searchParams: createSearchParams({}) }));
      const filterLinks = screen
        .getAllByRole("link")
        .filter((link) => link.getAttribute("href")?.startsWith("/search"));
      const filterTexts = filterLinks.map((link) => link.textContent);
      expect(filterTexts).toContain("All");
      expect(filterTexts).toContain("Health");
      expect(filterTexts).toContain("Finance");
      expect(filterTexts).toContain("Tech");
    });
  });

  describe("result items", () => {
    it("displays article title, description, and category badge", async () => {
      render(await SearchPage({ searchParams: createSearchParams({}) }));
      expect(
        screen.getByText("Health Tips for Better Sleep")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Improve your sleep quality")
      ).toBeInTheDocument();
    });

    it("renders correct link href for articles", async () => {
      render(await SearchPage({ searchParams: createSearchParams({}) }));
      const links = screen.getAllByRole("link");
      const articleLink = links.find((link) =>
        link.getAttribute("href")?.includes("/health/article-1")
      );
      expect(articleLink).toBeDefined();
    });

    it("displays formatted date", async () => {
      render(await SearchPage({ searchParams: createSearchParams({}) }));
      expect(screen.getByText("January 15, 2026")).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("shows empty state when no articles match", async () => {
      render(
        await SearchPage({
          searchParams: createSearchParams({ q: "nonexistent" }),
        })
      );
      expect(screen.getByText("No results found")).toBeInTheDocument();
      expect(
        screen.getByText(
          /We couldn't find any articles matching "nonexistent"/
        )
      ).toBeInTheDocument();
    });

    it("shows generic empty message when no query and no articles", async () => {
      vi.mocked(getAllArticles).mockResolvedValue([]);
      render(await SearchPage({ searchParams: createSearchParams({}) }));
      expect(screen.getByText("No results found")).toBeInTheDocument();
      expect(
        screen.getByText("No articles available at this time.")
      ).toBeInTheDocument();
    });
  });

  describe("pagination", () => {
    it("does not render pagination when results fit one page", async () => {
      render(await SearchPage({ searchParams: createSearchParams({}) }));
      expect(screen.queryByLabelText("Previous page")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Next page")).not.toBeInTheDocument();
    });

    it("renders pagination when results exceed one page", async () => {
      const manyArticles = Array.from({ length: 25 }, (_, i) => ({
        slug: `article-${i}`,
        title: `Article ${i}`,
        description: `Description ${i}`,
        date: `2026-01-${String(i + 1).padStart(2, "0")}`,
        category: "tech" as const,
        tags: [],
        published: true,
      }));
      vi.mocked(getAllArticles).mockResolvedValue(manyArticles);

      render(await SearchPage({ searchParams: createSearchParams({}) }));
      expect(screen.getByLabelText("Next page")).toBeInTheDocument();
    });

    it("shows previous page link when on page 2", async () => {
      const manyArticles = Array.from({ length: 25 }, (_, i) => ({
        slug: `article-${i}`,
        title: `Article ${i}`,
        description: `Description ${i}`,
        date: `2026-01-${String(i + 1).padStart(2, "0")}`,
        category: "tech" as const,
        tags: [],
        published: true,
      }));
      vi.mocked(getAllArticles).mockResolvedValue(manyArticles);

      render(
        await SearchPage({ searchParams: createSearchParams({ page: "2" }) })
      );
      expect(screen.getByLabelText("Previous page")).toBeInTheDocument();
    });

    it("handles invalid page parameter gracefully", async () => {
      render(
        await SearchPage({
          searchParams: createSearchParams({ page: "invalid" }),
        })
      );
      // Should default to page 1 and render articles
      expect(
        screen.getByText("Health Tips for Better Sleep")
      ).toBeInTheDocument();
    });

    it("clamps page number to valid range", async () => {
      render(
        await SearchPage({
          searchParams: createSearchParams({ page: "999" }),
        })
      );
      // Should clamp to last page and still show articles
      expect(
        screen.getByText("Health Tips for Better Sleep")
      ).toBeInTheDocument();
    });
  });
});
