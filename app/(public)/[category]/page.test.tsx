import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import CategoryPage from "./page";

// Mock the content API
vi.mock("@/lib/content/api", () => ({
  getArticlesByCategory: vi.fn(),
  getLatestArticles: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

// Mock sidebar components
vi.mock("@/components/layout/Sidebar/Sidebar", () => ({
  Sidebar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar">{children}</div>
  ),
}));

vi.mock("@/components/layout/Sidebar/PopularArticles", () => ({
  PopularArticles: () => <div data-testid="popular-articles" />,
}));

vi.mock("@/components/layout/Sidebar/AdSlot", () => ({
  AdSlot: () => <div data-testid="ad-slot" />,
}));

import { getArticlesByCategory, getLatestArticles } from "@/lib/content/api";
import { notFound } from "next/navigation";

const mockArticles = [
  {
    slug: "test-article-1",
    title: "テスト記事1",
    description: "テスト記事1の説明",
    date: "2026-01-27",
    category: "asset" as const,
    tags: ["投資"],
    published: true,
  },
  {
    slug: "test-article-2",
    title: "テスト記事2",
    description: "テスト記事2の説明",
    date: "2026-01-26",
    category: "asset" as const,
    tags: ["投資"],
    published: true,
  },
];

const renderWithChakra = async (params: { category: string }) => {
  const Component = await CategoryPage({ params: Promise.resolve(params) });
  return render(
    <ChakraProvider value={defaultSystem}>{Component}</ChakraProvider>
  );
};

describe("CategoryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getArticlesByCategory).mockResolvedValue(mockArticles);
    vi.mocked(getLatestArticles).mockResolvedValue(mockArticles);
  });

  afterEach(() => {
    cleanup();
  });

  describe("有効なカテゴリ", () => {
    it("assetカテゴリのページが表示される", async () => {
      await renderWithChakra({ category: "asset" });

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "資産形成"
      );
    });

    it("techカテゴリのページが表示される", async () => {
      await renderWithChakra({ category: "tech" });

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "プログラミング"
      );
    });

    it("healthカテゴリのページが表示される", async () => {
      await renderWithChakra({ category: "health" });

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "健康"
      );
    });

    it("記事カードが表示される", async () => {
      await renderWithChakra({ category: "asset" });

      expect(screen.getByText("テスト記事1")).toBeInTheDocument();
      expect(screen.getByText("テスト記事2")).toBeInTheDocument();
    });

    it("getArticlesByCategoryが正しいカテゴリで呼ばれる", async () => {
      await renderWithChakra({ category: "asset" });

      expect(getArticlesByCategory).toHaveBeenCalledWith("asset");
    });
  });

  describe("無効なカテゴリ", () => {
    it("無効なカテゴリの場合はnotFoundが呼ばれる", async () => {
      await renderWithChakra({ category: "invalid" });

      expect(notFound).toHaveBeenCalled();
    });
  });

  describe("記事が0件の場合", () => {
    it("記事がない場合はメッセージが表示される", async () => {
      vi.mocked(getArticlesByCategory).mockResolvedValue([]);

      await renderWithChakra({ category: "asset" });

      expect(
        screen.getByText("まだ記事がありません。")
      ).toBeInTheDocument();
    });
  });
});
