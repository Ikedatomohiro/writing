import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ArticleList } from "./ArticleList";
import type { Article } from "@/lib/articles/types";

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>
  );
}

function createTestArticle(overrides: Partial<Article> = {}): Article {
  return {
    id: "test-id",
    title: "テスト記事",
    content: "これはテスト記事の本文です。",
    keywords: ["React", "TypeScript"],
    status: "draft",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-15T12:30:00.000Z",
    publishedAt: null,
    ...overrides,
  };
}

describe("ArticleList", () => {
  afterEach(() => {
    cleanup();
  });

  it("記事が空の場合は「記事がありません」を表示する", () => {
    renderWithProviders(<ArticleList articles={[]} />);

    expect(screen.getByText("記事がありません")).toBeInTheDocument();
  });

  it("記事のリストを表示する", () => {
    const articles = [
      createTestArticle({ id: "1", title: "記事1" }),
      createTestArticle({ id: "2", title: "記事2" }),
      createTestArticle({ id: "3", title: "記事3" }),
    ];
    renderWithProviders(<ArticleList articles={articles} />);

    expect(screen.getByText("記事1")).toBeInTheDocument();
    expect(screen.getByText("記事2")).toBeInTheDocument();
    expect(screen.getByText("記事3")).toBeInTheDocument();
  });

  it("各記事がリンクとして表示される", () => {
    const articles = [
      createTestArticle({ id: "article-1", title: "記事1" }),
      createTestArticle({ id: "article-2", title: "記事2" }),
    ];
    renderWithProviders(<ArticleList articles={articles} />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "/articles/article-1");
    expect(links[1]).toHaveAttribute("href", "/articles/article-2");
  });

  it("記事のステータスバッジを表示する", () => {
    const articles = [
      createTestArticle({ id: "1", status: "draft" }),
      createTestArticle({ id: "2", status: "published" }),
    ];
    renderWithProviders(<ArticleList articles={articles} />);

    expect(screen.getByText("下書き")).toBeInTheDocument();
    expect(screen.getByText("公開")).toBeInTheDocument();
  });
});
