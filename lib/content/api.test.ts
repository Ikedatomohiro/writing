import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the reader module
vi.mock("./reader", () => ({
  listArticleFiles: vi.fn(),
  readArticleFile: vi.fn(),
}));

import {
  getArticlesByCategory,
  getAllArticles,
  getLatestArticles,
  getArticleBySlug,
  getRelatedArticles,
} from "./api";
import { listArticleFiles, readArticleFile } from "./reader";
import type { Article } from "./types";

const mockListArticleFiles = vi.mocked(listArticleFiles);
const mockReadArticleFile = vi.mocked(readArticleFile);

// Helper to create test articles
function createArticle(overrides: Partial<Article>): Article {
  return {
    slug: "test",
    title: "Test",
    description: "Test description",
    date: "2026-01-20",
    category: "asset",
    tags: [],
    published: true,
    content: "body",
    ...overrides,
  };
}

describe("Content API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getArticlesByCategory", () => {
    it("returns published articles for a category", async () => {
      mockListArticleFiles.mockResolvedValue(["article-1", "article-2"]);
      mockReadArticleFile
        .mockResolvedValueOnce(
          createArticle({ slug: "article-1", title: "Article 1", date: "2026-01-20", category: "asset", tags: ["invest"], published: true })
        )
        .mockResolvedValueOnce(
          createArticle({ slug: "article-2", title: "Article 2", date: "2026-01-22", category: "asset", tags: ["saving"], published: true })
        );

      const articles = await getArticlesByCategory("asset");

      expect(articles.length).toBe(2);
      expect(articles.every((a) => a.published)).toBe(true);
      expect(articles.every((a) => a.category === "asset")).toBe(true);
    });

    it("returns articles sorted by date descending", async () => {
      mockListArticleFiles.mockResolvedValue(["article-1", "article-2"]);
      mockReadArticleFile
        .mockResolvedValueOnce(
          createArticle({ slug: "article-1", date: "2026-01-20" })
        )
        .mockResolvedValueOnce(
          createArticle({ slug: "article-2", date: "2026-01-22" })
        );

      const articles = await getArticlesByCategory("asset");

      expect(articles[0].date).toBe("2026-01-22");
      expect(articles[1].date).toBe("2026-01-20");
    });

    it("includes draft articles when includeDrafts is true", async () => {
      mockListArticleFiles.mockResolvedValue(["article-1", "article-2", "draft"]);
      mockReadArticleFile
        .mockResolvedValueOnce(createArticle({ slug: "article-1", published: true }))
        .mockResolvedValueOnce(createArticle({ slug: "article-2", published: true }))
        .mockResolvedValueOnce(createArticle({ slug: "draft", published: false }));

      const articles = await getArticlesByCategory("asset", { includeDrafts: true });

      expect(articles.length).toBe(3);
    });

    it("excludes published articles whose title or description is empty (defense for malformed data)", async () => {
      mockListArticleFiles.mockResolvedValue([
        "good",
        "empty-title",
        "empty-desc",
        "whitespace-title",
      ]);
      mockReadArticleFile
        .mockResolvedValueOnce(createArticle({ slug: "good", title: "Good", description: "good desc" }))
        .mockResolvedValueOnce(createArticle({ slug: "empty-title", title: "", description: "desc" }))
        .mockResolvedValueOnce(createArticle({ slug: "empty-desc", title: "title", description: "" }))
        .mockResolvedValueOnce(createArticle({ slug: "whitespace-title", title: "   ", description: "desc" }));

      const articles = await getArticlesByCategory("asset");

      expect(articles.map((a) => a.slug)).toEqual(["good"]);
    });
  });

  describe("getAllArticles", () => {
    it("returns all published articles from all categories", async () => {
      // Called for asset, tech, health
      mockListArticleFiles
        .mockResolvedValueOnce(["article-1", "article-2"])
        .mockResolvedValueOnce(["tech-article"])
        .mockResolvedValueOnce(["health-article"]);

      mockReadArticleFile
        .mockResolvedValueOnce(createArticle({ slug: "article-1", category: "asset", date: "2026-01-20" }))
        .mockResolvedValueOnce(createArticle({ slug: "article-2", category: "asset", date: "2026-01-22" }))
        .mockResolvedValueOnce(createArticle({ slug: "tech-article", category: "tech", date: "2026-01-21" }))
        .mockResolvedValueOnce(createArticle({ slug: "health-article", category: "health", date: "2026-01-24" }));

      const articles = await getAllArticles();

      expect(articles.length).toBe(4);
      expect(articles.every((a) => a.published)).toBe(true);
    });

    it("returns articles sorted by date descending", async () => {
      mockListArticleFiles
        .mockResolvedValueOnce(["a1", "a2"])
        .mockResolvedValueOnce(["t1"])
        .mockResolvedValueOnce(["h1"]);

      mockReadArticleFile
        .mockResolvedValueOnce(createArticle({ slug: "a1", date: "2026-01-20" }))
        .mockResolvedValueOnce(createArticle({ slug: "a2", date: "2026-01-22" }))
        .mockResolvedValueOnce(createArticle({ slug: "t1", date: "2026-01-21" }))
        .mockResolvedValueOnce(createArticle({ slug: "h1", date: "2026-01-24" }));

      const articles = await getAllArticles();
      const dates = articles.map((a) => a.date);

      expect(dates).toEqual([...dates].sort().reverse());
    });
  });

  describe("getLatestArticles", () => {
    it("returns the specified number of latest articles", async () => {
      mockListArticleFiles
        .mockResolvedValueOnce(["a1", "a2"])
        .mockResolvedValueOnce(["t1"])
        .mockResolvedValueOnce(["h1"]);

      mockReadArticleFile
        .mockResolvedValueOnce(createArticle({ slug: "a1", date: "2026-01-20" }))
        .mockResolvedValueOnce(createArticle({ slug: "a2", date: "2026-01-22" }))
        .mockResolvedValueOnce(createArticle({ slug: "t1", date: "2026-01-21" }))
        .mockResolvedValueOnce(createArticle({ slug: "h1", date: "2026-01-24" }));

      const articles = await getLatestArticles(2);

      expect(articles.length).toBe(2);
      expect(articles[0].date).toBe("2026-01-24");
      expect(articles[1].date).toBe("2026-01-22");
    });
  });

  describe("getArticleBySlug", () => {
    it("returns article by category and slug", async () => {
      mockReadArticleFile.mockResolvedValue(
        createArticle({ slug: "tech-article", title: "Tech Article", category: "tech", content: "tech body" })
      );

      const article = await getArticleBySlug("tech", "tech-article");

      expect(article).not.toBeNull();
      expect(article?.title).toBe("Tech Article");
      expect(article?.content).toContain("tech body");
    });

    it("returns null for non-existent article", async () => {
      mockReadArticleFile.mockResolvedValue(null);

      const article = await getArticleBySlug("tech", "nonexistent");

      expect(article).toBeNull();
    });

    it("returns draft article", async () => {
      mockReadArticleFile.mockResolvedValue(
        createArticle({ slug: "draft", published: false })
      );

      const article = await getArticleBySlug("asset", "draft");

      expect(article).not.toBeNull();
      expect(article?.published).toBe(false);
    });
  });

  describe("getRelatedArticles", () => {
    it("returns articles from the same category excluding current", async () => {
      mockListArticleFiles.mockResolvedValue(["article-1", "article-2"]);
      mockReadArticleFile
        .mockResolvedValueOnce(createArticle({ slug: "article-1", date: "2026-01-20" }))
        .mockResolvedValueOnce(createArticle({ slug: "article-2", date: "2026-01-22" }));

      const articles = await getRelatedArticles("asset", "article-1", 5);

      expect(articles.length).toBe(1);
      expect(articles[0].slug).toBe("article-2");
    });

    it("respects the limit parameter", async () => {
      mockListArticleFiles.mockResolvedValue(["a1", "a2", "a3"]);
      mockReadArticleFile
        .mockResolvedValueOnce(createArticle({ slug: "a1", date: "2026-01-20" }))
        .mockResolvedValueOnce(createArticle({ slug: "a2", date: "2026-01-22" }))
        .mockResolvedValueOnce(createArticle({ slug: "a3", date: "2026-01-24" }));

      const articles = await getRelatedArticles("asset", "a1", 1);

      expect(articles.length).toBe(1);
    });

    it("returns empty array when no related articles exist", async () => {
      mockListArticleFiles.mockResolvedValue(["health-article"]);
      mockReadArticleFile.mockResolvedValueOnce(
        createArticle({ slug: "health-article", category: "health" })
      );

      const articles = await getRelatedArticles("health", "health-article", 5);

      expect(articles).toEqual([]);
    });
  });
});
