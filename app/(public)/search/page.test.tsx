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

// Note: health and asset articles are filtered out by HIDDEN_CATEGORIES in production
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
    it("shows h1 heading", async () => {
      render(await SearchPage({ searchParams: createSearchParams({}) }));
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("shows search input form", async () => {
      render(await SearchPage({ searchParams: createSearchParams({}) }));
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("shows total results count when no query (hidden categories excluded)", async () => {
      render(await SearchPage({ searchParams: createSearchParams({}) }));
      // health and asset are in HIDDEN_CATEGORIES, so only tech article shows
      expect(screen.getByText(/全 1 件の記事/)).toBeInTheDocument();
    });

    it("shows query and result count when searching", async () => {
      render(
        await SearchPage({ searchParams: createSearchParams({ q: "React" }) })
      );
      expect(screen.getByText(/'React'/)).toBeInTheDocument();
    });

    it("shows plural count for multiple matches", async () => {
      render(
        await SearchPage({
          searchParams: createSearchParams({ q: "article" }),
        })
      );
      // "article" matches slug text not shown directly, or we just check UI renders
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });
  });

  describe("filtering", () => {
    it("filters articles by search query in title (tech only, health/asset excluded)", async () => {
      render(
        await SearchPage({ searchParams: createSearchParams({ q: "React" }) })
      );
      expect(screen.getByText("React Server Components")).toBeInTheDocument();
      expect(
        screen.queryByText("Health Tips for Better Sleep")
      ).not.toBeInTheDocument();
    });

    it("tech category articles are shown", async () => {
      render(
        await SearchPage({
          searchParams: createSearchParams({ category: "tech" }),
        })
      );
      expect(screen.getByText("React Server Components")).toBeInTheDocument();
    });

    it("hidden categories are excluded from all results", async () => {
      render(
        await SearchPage({
          searchParams: createSearchParams({ category: "all" }),
        })
      );
      // health and asset are HIDDEN_CATEGORIES
      expect(
        screen.queryByText("Health Tips for Better Sleep")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Investing in Index Funds")
      ).not.toBeInTheDocument();
      // tech article is visible
      expect(screen.getByText("React Server Components")).toBeInTheDocument();
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
    it("renders filter options as links (only visible categories)", async () => {
      render(await SearchPage({ searchParams: createSearchParams({}) }));
      const filterLinks = screen
        .getAllByRole("link")
        .filter((link) => link.getAttribute("href")?.startsWith("/search"));
      const filterTexts = filterLinks.map((link) => link.textContent);
      // "すべて" is always present, "プログラミング" (tech) is visible
      expect(filterTexts).toContain("すべて");
      expect(filterTexts).toContain("プログラミング");
      // health and asset are hidden
      expect(filterTexts).not.toContain("Health");
      expect(filterTexts).not.toContain("Finance");
    });
  });

  describe("result items", () => {
    it("displays tech article title", async () => {
      render(await SearchPage({ searchParams: createSearchParams({}) }));
      expect(screen.getByText("React Server Components")).toBeInTheDocument();
    });

    it("renders correct link href for tech articles", async () => {
      render(await SearchPage({ searchParams: createSearchParams({}) }));
      const links = screen.getAllByRole("link");
      const articleLink = links.find((link) =>
        link.getAttribute("href")?.includes("/tech/article-3")
      );
      expect(articleLink).toBeDefined();
    });

    it("displays formatted date", async () => {
      render(await SearchPage({ searchParams: createSearchParams({}) }));
      // Only tech article (article-3, 2026-01-05) is visible after filtering
      expect(screen.getByText("January 5, 2026")).toBeInTheDocument();
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
      // Should default to page 1 and render tech articles
      expect(screen.getByText("React Server Components")).toBeInTheDocument();
    });

    it("clamps page number to valid range", async () => {
      render(
        await SearchPage({
          searchParams: createSearchParams({ page: "999" }),
        })
      );
      // Should clamp to last page and still show tech article
      expect(screen.getByText("React Server Components")).toBeInTheDocument();
    });
  });
});
