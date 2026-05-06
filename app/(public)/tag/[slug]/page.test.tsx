import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import TagPage, { generateMetadata } from "./page";
import type { ArticleMeta } from "@/lib/content/types";

vi.mock("@/lib/content/api", () => ({
  getArticlesByTag: vi.fn(),
}));

vi.mock("@/components/blog/BlogArticleCard/BlogArticleCard", () => ({
  BlogArticleCard: ({ article }: { article: ArticleMeta }) => (
    <div data-testid="article-card" data-slug={article.slug}>
      {article.title}
    </div>
  ),
}));

import { getArticlesByTag } from "@/lib/content/api";

function makeArticle(overrides: Partial<ArticleMeta>): ArticleMeta {
  return {
    slug: "x",
    title: "Title X",
    description: "desc",
    date: "2026-01-20",
    category: "tech",
    tags: ["ClaudeCode"],
    published: true,
    ...overrides,
  };
}

describe("Tag page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("rendering", () => {
    it("decodes the URL slug and queries getArticlesByTag with the original tag", async () => {
      vi.mocked(getArticlesByTag).mockResolvedValue([]);

      const page = await TagPage({
        params: Promise.resolve({ slug: encodeURIComponent("プログラミング") }),
      });
      render(page);

      expect(getArticlesByTag).toHaveBeenCalledWith("プログラミング");
    });

    it("renders the tag name in heading", async () => {
      vi.mocked(getArticlesByTag).mockResolvedValue([]);

      const page = await TagPage({
        params: Promise.resolve({ slug: "ClaudeCode" }),
      });
      render(page);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading.textContent).toContain("ClaudeCode");
    });

    it("renders one card per matching article", async () => {
      vi.mocked(getArticlesByTag).mockResolvedValue([
        makeArticle({ slug: "a1", title: "A1" }),
        makeArticle({ slug: "a2", title: "A2" }),
        makeArticle({ slug: "a3", title: "A3" }),
      ]);

      const page = await TagPage({
        params: Promise.resolve({ slug: "ClaudeCode" }),
      });
      render(page);

      const cards = screen.getAllByTestId("article-card");
      expect(cards).toHaveLength(3);
    });

    it("renders an empty state when no article matches", async () => {
      vi.mocked(getArticlesByTag).mockResolvedValue([]);

      const page = await TagPage({
        params: Promise.resolve({ slug: "no-such-tag" }),
      });
      render(page);

      expect(screen.queryAllByTestId("article-card")).toHaveLength(0);
      expect(screen.getByText(/まだ記事がありません|該当する記事がありません/)).toBeInTheDocument();
    });
  });

  describe("generateMetadata", () => {
    it("returns title containing the tag name", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: encodeURIComponent("プログラミング") }),
      });

      expect(String(metadata.title)).toContain("プログラミング");
    });

    it("sets canonical to /tag/<encoded slug>", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: encodeURIComponent("プログラミング") }),
      });

      expect(metadata.alternates?.canonical).toBe(
        `/tag/${encodeURIComponent("プログラミング")}`
      );
    });
  });
});
