import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { BlogArticleCard } from "./BlogArticleCard";
import type { ArticleMeta } from "@/lib/content/types";

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>
  );
}

function createTestArticle(overrides: Partial<ArticleMeta> = {}): ArticleMeta {
  return {
    slug: "test-article",
    title: "テスト記事のタイトル",
    description: "これはテスト記事の概要です。",
    date: "2024-01-15",
    category: "asset",
    tags: ["投資", "初心者"],
    thumbnail: "/images/test.jpg",
    published: true,
    ...overrides,
  };
}

describe("BlogArticleCard", () => {
  afterEach(() => {
    cleanup();
  });

  describe("表示要素", () => {
    it("タイトルを表示する", () => {
      const article = createTestArticle({ title: "記事タイトルテスト" });
      renderWithProviders(<BlogArticleCard article={article} />);

      expect(screen.getByText("記事タイトルテスト")).toBeInTheDocument();
    });

    it("概要を表示する", () => {
      const article = createTestArticle({ description: "概要テスト文章" });
      renderWithProviders(<BlogArticleCard article={article} />);

      expect(screen.getByText("概要テスト文章")).toBeInTheDocument();
    });

    it("投稿日をYYYY.MM.DD形式で表示する", () => {
      const article = createTestArticle({ date: "2024-03-15" });
      renderWithProviders(<BlogArticleCard article={article} />);

      expect(screen.getByText("2024.03.15")).toBeInTheDocument();
    });

    it("読了時間を表示する（propsで指定された場合）", () => {
      const article = createTestArticle();
      renderWithProviders(
        <BlogArticleCard article={article} readingTime="5 min read" />
      );

      expect(screen.getByText("5 min read")).toBeInTheDocument();
    });

    it("サムネイル画像を表示する", () => {
      const article = createTestArticle({ thumbnail: "/images/thumb.jpg" });
      renderWithProviders(<BlogArticleCard article={article} />);

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("alt", article.title);
    });

    it("サムネイルがない場合はプレースホルダーを表示する", () => {
      const article = createTestArticle({ thumbnail: undefined });
      renderWithProviders(<BlogArticleCard article={article} />);

      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(screen.getByTestId("thumbnail-placeholder")).toBeInTheDocument();
    });
  });

  describe("カテゴリ表示", () => {
    it("assetカテゴリを「投資」として表示する", () => {
      const article = createTestArticle({ category: "asset" });
      renderWithProviders(<BlogArticleCard article={article} />);

      expect(screen.getByText("投資")).toBeInTheDocument();
    });

    it("techカテゴリを「プログラミング」として表示する", () => {
      const article = createTestArticle({ category: "tech" });
      renderWithProviders(<BlogArticleCard article={article} />);

      expect(screen.getByText("プログラミング")).toBeInTheDocument();
    });

    it("healthカテゴリを「健康」として表示する", () => {
      const article = createTestArticle({ category: "health" });
      renderWithProviders(<BlogArticleCard article={article} />);

      expect(screen.getByText("健康")).toBeInTheDocument();
    });
  });

  describe("リンク", () => {
    it("記事詳細ページへのリンクを持つ", () => {
      const article = createTestArticle({
        category: "asset",
        slug: "my-article",
      });
      renderWithProviders(<BlogArticleCard article={article} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/asset/my-article");
    });

    it("techカテゴリの場合は/tech/slugへリンクする", () => {
      const article = createTestArticle({
        category: "tech",
        slug: "programming-tips",
      });
      renderWithProviders(<BlogArticleCard article={article} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/tech/programming-tips");
    });
  });

  describe("アクセシビリティ", () => {
    it("article要素としてレンダリングされる", () => {
      const article = createTestArticle();
      renderWithProviders(<BlogArticleCard article={article} />);

      expect(screen.getByRole("article")).toBeInTheDocument();
    });
  });
});
