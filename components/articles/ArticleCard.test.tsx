import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";
import { ArticleCard } from "./ArticleCard";
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

describe("ArticleCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("記事のタイトルを表示する", () => {
    const article = createTestArticle({ title: "私の記事タイトル" });
    render(<ArticleCard article={article} />);

    expect(screen.getByText("私の記事タイトル")).toBeInTheDocument();
  });

  it("タイトルが空の場合は「無題」を表示する", () => {
    const article = createTestArticle({ title: "" });
    render(<ArticleCard article={article} />);

    expect(screen.getByText("無題")).toBeInTheDocument();
  });

  it("下書き状態の場合「下書き」バッジを表示する", () => {
    const article = createTestArticle({ published: false });
    render(<ArticleCard article={article} />);

    expect(screen.getByText("下書き")).toBeInTheDocument();
  });

  it("公開状態の場合「公開」バッジを表示する", () => {
    const article = createTestArticle({ published: true });
    render(<ArticleCard article={article} />);

    expect(screen.getByText("公開")).toBeInTheDocument();
  });

  it("説明を表示する", () => {
    const article = createTestArticle({ description: "これは説明です。" });
    render(<ArticleCard article={article} />);

    expect(screen.getByText("これは説明です。")).toBeInTheDocument();
  });

  it("説明が空の場合は「説明なし」を表示する", () => {
    const article = createTestArticle({ description: "" });
    render(<ArticleCard article={article} />);

    expect(screen.getByText("説明なし")).toBeInTheDocument();
  });

  it("タグを表示する", () => {
    const article = createTestArticle({ tags: ["React", "Next.js"] });
    render(<ArticleCard article={article} />);

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Next.js")).toBeInTheDocument();
  });

  it("タグが3つを超える場合は3つまで表示し残りの数を表示する", () => {
    const article = createTestArticle({
      tags: ["React", "Next.js", "TypeScript", "Vitest", "Testing"],
    });
    render(<ArticleCard article={article} />);

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Next.js")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.queryByText("Vitest")).not.toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("日付を日本語フォーマットで表示する", () => {
    const article = createTestArticle({
      date: "2024-03-15T00:00:00.000Z",
    });
    render(<ArticleCard article={article} />);

    expect(screen.getByText(/2024\/3\/15/)).toBeInTheDocument();
  });

  it("記事詳細ページへのリンクを持つ", () => {
    const article = createTestArticle({ slug: "article-123" });
    render(<ArticleCard article={article} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/articles/article-123");
  });
});
