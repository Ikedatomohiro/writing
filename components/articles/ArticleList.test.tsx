import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";
import { ArticleList } from "./ArticleList";
import type { Article } from "@/lib/content/types";

function createTestArticle(overrides: Partial<Article> = {}): Article {
  return {
    slug: "test-slug",
    title: "テスト記事",
    description: "テスト記事の説明です。",
    content: "これはテスト記事の本文です。",
    category: "tech",
    tags: ["React", "TypeScript"],
    published: false,
    date: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("ArticleList", () => {
  afterEach(() => {
    cleanup();
  });

  it("記事が空の場合は「記事がありません」を表示する", () => {
    render(<ArticleList articles={[]} />);

    expect(screen.getByText("記事がありません")).toBeInTheDocument();
  });

  it("記事のリストを表示する", () => {
    const articles = [
      createTestArticle({ slug: "1", title: "記事1" }),
      createTestArticle({ slug: "2", title: "記事2" }),
      createTestArticle({ slug: "3", title: "記事3" }),
    ];
    render(<ArticleList articles={articles} />);

    expect(screen.getByText("記事1")).toBeInTheDocument();
    expect(screen.getByText("記事2")).toBeInTheDocument();
    expect(screen.getByText("記事3")).toBeInTheDocument();
  });

  it("各記事がリンクとして表示される", () => {
    const articles = [
      createTestArticle({ slug: "article-1", title: "記事1" }),
      createTestArticle({ slug: "article-2", title: "記事2" }),
    ];
    render(<ArticleList articles={articles} />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "/articles/article-1");
    expect(links[1]).toHaveAttribute("href", "/articles/article-2");
  });

  it("記事のステータスバッジを表示する", () => {
    const articles = [
      createTestArticle({ slug: "1", published: false }),
      createTestArticle({ slug: "2", published: true }),
    ];
    render(<ArticleList articles={articles} />);

    expect(screen.getByText("下書き")).toBeInTheDocument();
    expect(screen.getByText("公開")).toBeInTheDocument();
  });
});
