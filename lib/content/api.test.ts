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
  getArticlesByTag,
  getAllTags,
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
    // resetAllMocks は mockResolvedValueOnce のキューも破棄する。
    // clearAllMocks だと消費されなかった once 値が後続テストへ漏れるため使わない。
    vi.resetAllMocks();
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
    // getAllArticles は CATEGORIES を走査する。現在の公開カテゴリは tech のみ
    // （asset/health は HIDDEN_CATEGORIES）。よって tech のみが集約対象となる。
    it("returns all published articles from public categories (tech only)", async () => {
      mockListArticleFiles.mockResolvedValue(["tech-1", "tech-2"]);
      mockReadArticleFile
        .mockResolvedValueOnce(createArticle({ slug: "tech-1", category: "tech", date: "2026-01-20" }))
        .mockResolvedValueOnce(createArticle({ slug: "tech-2", category: "tech", date: "2026-01-22" }));

      const articles = await getAllArticles();

      expect(articles.length).toBe(2);
      expect(articles.every((a) => a.published)).toBe(true);
      expect(articles.every((a) => a.category === "tech")).toBe(true);
    });

    it("returns articles sorted by date descending", async () => {
      mockListArticleFiles.mockResolvedValue(["t1", "t2", "t3"]);
      mockReadArticleFile
        .mockResolvedValueOnce(createArticle({ slug: "t1", category: "tech", date: "2026-01-20" }))
        .mockResolvedValueOnce(createArticle({ slug: "t2", category: "tech", date: "2026-01-24" }))
        .mockResolvedValueOnce(createArticle({ slug: "t3", category: "tech", date: "2026-01-21" }));

      const articles = await getAllArticles();
      const dates = articles.map((a) => a.date);

      expect(dates).toEqual([...dates].sort().reverse());
    });
  });

  describe("getLatestArticles", () => {
    it("returns the specified number of latest articles", async () => {
      mockListArticleFiles.mockResolvedValue(["t1", "t2", "t3"]);
      mockReadArticleFile
        .mockResolvedValueOnce(createArticle({ slug: "t1", category: "tech", date: "2026-01-20" }))
        .mockResolvedValueOnce(createArticle({ slug: "t2", category: "tech", date: "2026-01-24" }))
        .mockResolvedValueOnce(createArticle({ slug: "t3", category: "tech", date: "2026-01-22" }));

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

  describe("getArticlesByTag", () => {
    function setupAllCategories(articles: Article[]) {
      const byCategory: Record<string, Article[]> = {
        asset: [],
        tech: [],
        health: [],
      };
      for (const a of articles) {
        byCategory[a.category].push(a);
      }
      // 前テストの mockResolvedValueOnce キュー残骸を一掃する
      mockListArticleFiles.mockReset();
      mockReadArticleFile.mockReset();
      mockListArticleFiles.mockImplementation(async (category: string) =>
        (byCategory[category] ?? []).map((a) => a.slug)
      );
      mockReadArticleFile.mockImplementation(async (category: string, slug: string) => {
        return (byCategory[category] ?? []).find((a) => a.slug === slug) ?? null;
      });
    }

    it("returns published articles tagged with the given tag (case-insensitive match)", async () => {
      setupAllCategories([
        createArticle({
          slug: "claude-1",
          category: "tech",
          tags: ["ClaudeCode", "AIエージェント"],
          date: "2026-01-20",
        }),
        createArticle({
          slug: "no-tag",
          category: "tech",
          tags: ["プログラミング"],
          date: "2026-01-19",
        }),
        createArticle({
          slug: "claude-2",
          category: "tech",
          tags: ["claudecode"],
          date: "2026-01-22",
        }),
      ]);

      const articles = await getArticlesByTag("ClaudeCode");

      expect(articles.length).toBe(2);
      expect(articles.map((a) => a.slug).sort()).toEqual(
        ["claude-1", "claude-2"].sort()
      );
    });

    it("excludes draft articles", async () => {
      setupAllCategories([
        createArticle({
          slug: "draft",
          category: "tech",
          tags: ["AIエージェント"],
          published: false,
        }),
        createArticle({
          slug: "published",
          category: "tech",
          tags: ["AIエージェント"],
          published: true,
        }),
      ]);

      const articles = await getArticlesByTag("AIエージェント");

      expect(articles.map((a) => a.slug)).toEqual(["published"]);
    });

    it("returns empty array when no article matches", async () => {
      setupAllCategories([
        createArticle({ slug: "x", category: "tech", tags: ["foo"] }),
      ]);

      const articles = await getArticlesByTag("nonexistent");

      expect(articles).toEqual([]);
    });

    it("sorts results by date desc", async () => {
      setupAllCategories([
        createArticle({
          slug: "old",
          category: "tech",
          tags: ["AI"],
          date: "2026-01-10",
        }),
        createArticle({
          slug: "new",
          category: "tech",
          tags: ["AI"],
          date: "2026-01-20",
        }),
      ]);

      const articles = await getArticlesByTag("AI");

      expect(articles[0].slug).toBe("new");
      expect(articles[1].slug).toBe("old");
    });
  });

  describe("getAllTags", () => {
    function setupAllCategories(articles: Article[]) {
      const byCategory: Record<string, Article[]> = {
        asset: [],
        tech: [],
        health: [],
      };
      for (const a of articles) {
        byCategory[a.category].push(a);
      }
      mockListArticleFiles.mockImplementation(async (category: string) =>
        (byCategory[category] ?? []).map((a) => a.slug)
      );
      mockReadArticleFile.mockImplementation(async (category: string, slug: string) => {
        return (byCategory[category] ?? []).find((a) => a.slug === slug) ?? null;
      });
    }

    it("aggregates tag counts across all published articles", async () => {
      setupAllCategories([
        createArticle({
          slug: "a1",
          category: "tech",
          tags: ["ClaudeCode", "AIエージェント"],
        }),
        createArticle({
          slug: "a2",
          category: "tech",
          tags: ["ClaudeCode", "プログラミング"],
        }),
      ]);

      const tags = await getAllTags();

      const claude = tags.find((t) => t.tag === "ClaudeCode");
      expect(claude?.count).toBe(2);
      const ai = tags.find((t) => t.tag === "AIエージェント");
      expect(ai?.count).toBe(1);
    });

    it("returns tags sorted by count desc then by name asc", async () => {
      setupAllCategories([
        createArticle({ slug: "a1", category: "tech", tags: ["a", "b", "c"] }),
        createArticle({ slug: "a2", category: "tech", tags: ["b"] }),
        createArticle({ slug: "a3", category: "tech", tags: ["b", "c"] }),
      ]);

      const tags = await getAllTags();

      // b=3, c=2, a=1
      expect(tags.map((t) => t.tag)).toEqual(["b", "c", "a"]);
    });

    it("excludes draft articles", async () => {
      setupAllCategories([
        createArticle({
          slug: "draft",
          category: "tech",
          tags: ["secret-tag"],
          published: false,
        }),
      ]);

      const tags = await getAllTags();

      expect(tags.find((t) => t.tag === "secret-tag")).toBeUndefined();
    });
  });
});
