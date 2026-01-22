import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ArticleCard } from "./ArticleCard";
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

describe("ArticleCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("記事のタイトルを表示する", () => {
    const article = createTestArticle({ title: "私の記事タイトル" });
    renderWithProviders(<ArticleCard article={article} />);

    expect(screen.getByText("私の記事タイトル")).toBeInTheDocument();
  });

  it("タイトルが空の場合は「無題」を表示する", () => {
    const article = createTestArticle({ title: "" });
    renderWithProviders(<ArticleCard article={article} />);

    expect(screen.getByText("無題")).toBeInTheDocument();
  });

  it("下書きステータスの場合「下書き」バッジを表示する", () => {
    const article = createTestArticle({ status: "draft" });
    renderWithProviders(<ArticleCard article={article} />);

    expect(screen.getByText("下書き")).toBeInTheDocument();
  });

  it("公開ステータスの場合「公開」バッジを表示する", () => {
    const article = createTestArticle({ status: "published" });
    renderWithProviders(<ArticleCard article={article} />);

    expect(screen.getByText("公開")).toBeInTheDocument();
  });

  it("アーカイブステータスの場合「アーカイブ」バッジを表示する", () => {
    const article = createTestArticle({ status: "archived" });
    renderWithProviders(<ArticleCard article={article} />);

    expect(screen.getByText("アーカイブ")).toBeInTheDocument();
  });

  it("本文の先頭部分を表示する", () => {
    const article = createTestArticle({ content: "これは本文の内容です。" });
    renderWithProviders(<ArticleCard article={article} />);

    expect(screen.getByText("これは本文の内容です。")).toBeInTheDocument();
  });

  it("本文が空の場合は「本文なし」を表示する", () => {
    const article = createTestArticle({ content: "" });
    renderWithProviders(<ArticleCard article={article} />);

    expect(screen.getByText("本文なし")).toBeInTheDocument();
  });

  it("キーワードを表示する", () => {
    const article = createTestArticle({ keywords: ["React", "Next.js"] });
    renderWithProviders(<ArticleCard article={article} />);

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Next.js")).toBeInTheDocument();
  });

  it("キーワードが3つを超える場合は3つまで表示し残りの数を表示する", () => {
    const article = createTestArticle({
      keywords: ["React", "Next.js", "TypeScript", "Vitest", "Testing"],
    });
    renderWithProviders(<ArticleCard article={article} />);

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Next.js")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.queryByText("Vitest")).not.toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("更新日を日本語フォーマットで表示する", () => {
    const article = createTestArticle({
      updatedAt: "2024-03-15T00:00:00.000Z",
    });
    renderWithProviders(<ArticleCard article={article} />);

    expect(screen.getByText(/更新:/)).toBeInTheDocument();
    expect(screen.getByText(/2024\/3\/15/)).toBeInTheDocument();
  });

  it("記事詳細ページへのリンクを持つ", () => {
    const article = createTestArticle({ id: "article-123" });
    renderWithProviders(<ArticleCard article={article} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/articles/article-123");
  });
});
