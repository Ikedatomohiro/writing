import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithChakra } from "@/app/test-utils";
import ArticleDetailPage, { generateStaticParams, generateMetadata } from "./page";
import type { Category, Article, ArticleMeta } from "@/lib/content/types";

// Mock content API
vi.mock("@/lib/content/api", () => ({
  getArticleBySlug: vi.fn(),
  getRelatedArticles: vi.fn(),
  getAllArticles: vi.fn(),
}));

// Mock MDX compiler
vi.mock("@/lib/content/mdx", () => ({
  compileMDXContent: vi.fn(),
}));

// Mock components
vi.mock("@/components/blog/ArticleBody", () => ({
  ArticleBody: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="article-body">{children}</div>
  ),
}));

vi.mock("@/components/blog/RelatedArticles", () => ({
  RelatedArticles: () => <div data-testid="related-articles">Related Articles</div>,
}));

vi.mock("@/components/ui/ShareButton", () => ({
  ShareButtonGroup: ({ url, title }: { url: string; title: string }) => (
    <div data-testid="share-buttons" data-url={url} data-title={title}>
      Share Buttons
    </div>
  ),
}));

vi.mock("@/components/ui/Ad", () => ({
  Ad: ({ variant }: { variant: string }) => (
    <div data-testid={`ad-${variant}`}>Ad {variant}</div>
  ),
}));

vi.mock("@/components/layout/Sidebar", () => ({
  Sidebar: ({ children }: { children: React.ReactNode }) => (
    <aside data-testid="sidebar">{children}</aside>
  ),
  TableOfContentsContainer: () => <div data-testid="toc">TOC</div>,
  AdSlot: ({ size }: { size: string }) => (
    <div data-testid={`ad-slot-${size}`}>Ad Slot</div>
  ),
}));

vi.mock("@/components/ui/Tag", () => ({
  Tag: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="category-tag">{children}</span>
  ),
}));

import { getArticleBySlug, getAllArticles } from "@/lib/content/api";
import { compileMDXContent } from "@/lib/content/mdx";

const mockArticle: Article = {
  slug: "test-article",
  title: "テスト記事タイトル",
  description: "テスト記事の説明文です",
  date: "2026-01-15",
  updatedAt: "2026-01-20",
  category: "tech" as Category,
  tags: ["React", "Next.js"],
  thumbnail: "/images/test.jpg",
  published: true,
  content: "# 記事本文\n\nこれはテスト記事です。",
};

const mockArticleMeta: ArticleMeta = {
  slug: "test-article",
  title: "テスト記事タイトル",
  description: "テスト記事の説明文です",
  date: "2026-01-15",
  category: "tech" as Category,
  tags: ["React"],
  published: true,
};

describe("ArticleDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Page Rendering", () => {
    it("renders article title", async () => {
      vi.mocked(getArticleBySlug).mockResolvedValue(mockArticle);
      vi.mocked(compileMDXContent).mockResolvedValue({
        content: <p>Compiled content</p>,
        frontmatter: {},
      });

      const page = await ArticleDetailPage({
        params: Promise.resolve({ category: "tech", slug: "test-article" }),
      });
      renderWithChakra(page);

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "テスト記事タイトル"
      );
    });

    it("renders article date", async () => {
      vi.mocked(getArticleBySlug).mockResolvedValue(mockArticle);
      vi.mocked(compileMDXContent).mockResolvedValue({
        content: <p>Compiled content</p>,
        frontmatter: {},
      });

      const page = await ArticleDetailPage({
        params: Promise.resolve({ category: "tech", slug: "test-article" }),
      });
      renderWithChakra(page);

      expect(screen.getAllByText(/2026年1月15日/).length).toBeGreaterThan(0);
    });

    it("renders updated date when available", async () => {
      vi.mocked(getArticleBySlug).mockResolvedValue(mockArticle);
      vi.mocked(compileMDXContent).mockResolvedValue({
        content: <p>Compiled content</p>,
        frontmatter: {},
      });

      const page = await ArticleDetailPage({
        params: Promise.resolve({ category: "tech", slug: "test-article" }),
      });
      renderWithChakra(page);

      expect(screen.getAllByText(/更新:/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/2026年1月20日/).length).toBeGreaterThan(0);
    });

    it("renders category tag", async () => {
      vi.mocked(getArticleBySlug).mockResolvedValue(mockArticle);
      vi.mocked(compileMDXContent).mockResolvedValue({
        content: <p>Compiled content</p>,
        frontmatter: {},
      });

      const page = await ArticleDetailPage({
        params: Promise.resolve({ category: "tech", slug: "test-article" }),
      });
      renderWithChakra(page);

      expect(screen.getAllByTestId("category-tag").length).toBeGreaterThan(0);
    });

    it("renders article body", async () => {
      vi.mocked(getArticleBySlug).mockResolvedValue(mockArticle);
      vi.mocked(compileMDXContent).mockResolvedValue({
        content: <p>Compiled content</p>,
        frontmatter: {},
      });

      const page = await ArticleDetailPage({
        params: Promise.resolve({ category: "tech", slug: "test-article" }),
      });
      renderWithChakra(page);

      expect(screen.getAllByTestId("article-body").length).toBeGreaterThan(0);
    });

    it("renders share buttons", async () => {
      vi.mocked(getArticleBySlug).mockResolvedValue(mockArticle);
      vi.mocked(compileMDXContent).mockResolvedValue({
        content: <p>Compiled content</p>,
        frontmatter: {},
      });

      const page = await ArticleDetailPage({
        params: Promise.resolve({ category: "tech", slug: "test-article" }),
      });
      renderWithChakra(page);

      expect(screen.getAllByTestId("share-buttons").length).toBeGreaterThan(0);
    });

    it("renders related articles section", async () => {
      vi.mocked(getArticleBySlug).mockResolvedValue(mockArticle);
      vi.mocked(compileMDXContent).mockResolvedValue({
        content: <p>Compiled content</p>,
        frontmatter: {},
      });

      const page = await ArticleDetailPage({
        params: Promise.resolve({ category: "tech", slug: "test-article" }),
      });
      renderWithChakra(page);

      expect(screen.getAllByTestId("related-articles").length).toBeGreaterThan(0);
    });

    it("renders sidebar with TOC", async () => {
      vi.mocked(getArticleBySlug).mockResolvedValue(mockArticle);
      vi.mocked(compileMDXContent).mockResolvedValue({
        content: <p>Compiled content</p>,
        frontmatter: {},
      });

      const page = await ArticleDetailPage({
        params: Promise.resolve({ category: "tech", slug: "test-article" }),
      });
      renderWithChakra(page);

      expect(screen.getAllByTestId("sidebar").length).toBeGreaterThan(0);
      expect(screen.getAllByTestId("toc").length).toBeGreaterThan(0);
    });

    it("renders ads in correct positions", async () => {
      vi.mocked(getArticleBySlug).mockResolvedValue(mockArticle);
      vi.mocked(compileMDXContent).mockResolvedValue({
        content: <p>Compiled content</p>,
        frontmatter: {},
      });

      const page = await ArticleDetailPage({
        params: Promise.resolve({ category: "tech", slug: "test-article" }),
      });
      renderWithChakra(page);

      // 広告が存在すること
      const ads = screen.getAllByTestId(/^ad-/);
      expect(ads.length).toBeGreaterThan(0);
    });
  });

  describe("404 Handling", () => {
    it("throws notFound when article does not exist", async () => {
      vi.mocked(getArticleBySlug).mockResolvedValue(null);

      await expect(
        ArticleDetailPage({
          params: Promise.resolve({ category: "tech", slug: "non-existent" }),
        })
      ).rejects.toThrow();
    });

    it("throws notFound for invalid category", async () => {
      await expect(
        ArticleDetailPage({
          params: Promise.resolve({ category: "invalid", slug: "test-article" }),
        })
      ).rejects.toThrow();
    });
  });

  describe("generateStaticParams", () => {
    it("returns all published articles as params", async () => {
      vi.mocked(getAllArticles).mockResolvedValue([
        { ...mockArticleMeta, category: "tech", slug: "article-1" },
        { ...mockArticleMeta, category: "asset", slug: "article-2" },
        { ...mockArticleMeta, category: "health", slug: "article-3" },
      ]);

      const params = await generateStaticParams();

      expect(params).toHaveLength(3);
      expect(params).toContainEqual({ category: "tech", slug: "article-1" });
      expect(params).toContainEqual({ category: "asset", slug: "article-2" });
      expect(params).toContainEqual({ category: "health", slug: "article-3" });
    });
  });

  describe("generateMetadata", () => {
    it("returns correct metadata for existing article", async () => {
      vi.mocked(getArticleBySlug).mockResolvedValue(mockArticle);

      const metadata = await generateMetadata({
        params: Promise.resolve({ category: "tech", slug: "test-article" }),
      });

      expect(metadata.title).toBe("テスト記事タイトル");
      expect(metadata.description).toBe("テスト記事の説明文です");
    });

    it("returns default metadata when article not found", async () => {
      vi.mocked(getArticleBySlug).mockResolvedValue(null);

      const metadata = await generateMetadata({
        params: Promise.resolve({ category: "tech", slug: "non-existent" }),
      });

      expect(metadata.title).toBe("記事が見つかりません");
    });
  });
});
