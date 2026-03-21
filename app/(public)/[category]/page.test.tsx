import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

const mockTechArticles = [
  {
    slug: "tech-article-1",
    title: "Tech記事1",
    description: "Tech記事1の説明",
    date: "2026-01-27",
    category: "tech" as const,
    tags: ["Frontend"],
    published: true,
  },
  {
    slug: "tech-article-2",
    title: "Tech記事2",
    description: "Tech記事2の説明",
    date: "2026-01-26",
    category: "tech" as const,
    tags: ["Backend"],
    published: true,
  },
];

const renderPage = async (params: { category: string }) => {
  const Component = await CategoryPage({ params: Promise.resolve(params) });
  return render(<>{Component}</>);
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
      await renderPage({ category: "asset" });

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "資産形成"
      );
    });

    it("techカテゴリのページが表示される", async () => {
      vi.mocked(getArticlesByCategory).mockResolvedValue(mockTechArticles);
      await renderPage({ category: "tech" });

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "プログラミング"
      );
    });

    it("healthカテゴリのページが表示される", async () => {
      await renderPage({ category: "health" });

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "健康"
      );
    });

    it("記事カードが表示される", async () => {
      await renderPage({ category: "asset" });

      expect(screen.getByText("テスト記事1")).toBeInTheDocument();
      expect(screen.getByText("テスト記事2")).toBeInTheDocument();
    });

    it("getArticlesByCategoryが正しいカテゴリで呼ばれる", async () => {
      await renderPage({ category: "asset" });

      expect(getArticlesByCategory).toHaveBeenCalledWith("asset");
    });
  });

  describe("無効なカテゴリ", () => {
    it("無効なカテゴリの場合はnotFoundが呼ばれる", async () => {
      await renderPage({ category: "invalid" });

      expect(notFound).toHaveBeenCalled();
    });
  });

  describe("記事が0件の場合", () => {
    it("記事がない場合はメッセージが表示される", async () => {
      vi.mocked(getArticlesByCategory).mockResolvedValue([]);

      await renderPage({ category: "asset" });

      expect(
        screen.getByText("まだ記事がありません。")
      ).toBeInTheDocument();
    });
  });

  describe("Fix 1: Tech dark theme", () => {
    it("techカテゴリではdata-theme='programming'が設定される", async () => {
      vi.mocked(getArticlesByCategory).mockResolvedValue(mockTechArticles);
      await renderPage({ category: "tech" });

      const themeContainer = screen.getByTestId("category-theme-container");
      expect(themeContainer).toHaveAttribute("data-theme", "programming");
    });

    it("assetカテゴリではdata-theme='asset'が設定される", async () => {
      await renderPage({ category: "asset" });

      const themeContainer = screen.getByTestId("category-theme-container");
      expect(themeContainer).toHaveAttribute("data-theme", "asset");
    });

    it("healthカテゴリではdata-theme='health'が設定される", async () => {
      await renderPage({ category: "health" });

      const themeContainer = screen.getByTestId("category-theme-container");
      expect(themeContainer).toHaveAttribute("data-theme", "health");
    });
  });

  describe("Fix 2: Tech glass-card bento layout", () => {
    it("techカテゴリではglass-cardスタイルのカードが表示される", async () => {
      vi.mocked(getArticlesByCategory).mockResolvedValue(mockTechArticles);
      await renderPage({ category: "tech" });

      const bentoGrid = screen.getByTestId("tech-bento-grid");
      expect(bentoGrid).toBeInTheDocument();
    });

    it("assetカテゴリではglass-cardは使われない", async () => {
      await renderPage({ category: "asset" });

      expect(screen.queryByTestId("tech-bento-grid")).not.toBeInTheDocument();
    });
  });

  describe("Fix 3: Category header size", () => {
    it("カテゴリタイトルがtext-5xlクラスを持つ", async () => {
      await renderPage({ category: "asset" });

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading.className).toContain("text-5xl");
      expect(heading.className).toContain("md:text-7xl");
      expect(heading.className).toContain("tracking-tighter");
      expect(heading.className).toContain("leading-none");
    });
  });

  describe("Fix 4: Sub-category filter pills for all categories", () => {
    it("assetカテゴリでフィルターピルが表示される", async () => {
      await renderPage({ category: "asset" });

      const pills = screen.getByTestId("category-pills");
      expect(pills).toBeInTheDocument();
      expect(screen.getByText("Markets")).toBeInTheDocument();
      expect(screen.getByText("Retirement")).toBeInTheDocument();
    });

    it("healthカテゴリでフィルターピルが表示される", async () => {
      await renderPage({ category: "health" });

      const pills = screen.getByTestId("category-pills");
      expect(pills).toBeInTheDocument();
      expect(screen.getByText("Nutrition")).toBeInTheDocument();
      expect(screen.getByText("Fitness")).toBeInTheDocument();
    });

    it("techカテゴリでフィルターピルが表示される", async () => {
      vi.mocked(getArticlesByCategory).mockResolvedValue(mockTechArticles);
      await renderPage({ category: "tech" });

      const pills = screen.getByTestId("category-pills");
      expect(pills).toBeInTheDocument();
      expect(screen.getByText("Frontend")).toBeInTheDocument();
      expect(screen.getByText("AI")).toBeInTheDocument();
    });
  });

  describe("Fix 5: 12-column grid layout", () => {
    it("メインコンテンツとサイドバーが12カラムグリッドで配置される", async () => {
      await renderPage({ category: "asset" });

      const gridContainer = screen.getByTestId("category-grid");
      expect(gridContainer.className).toContain("grid");
      expect(gridContainer.className).toContain("lg:grid-cols-12");
    });

    it("メインコンテンツがlg:col-span-8を持つ", async () => {
      await renderPage({ category: "asset" });

      const main = screen.getByRole("main");
      expect(main.className).toContain("lg:col-span-8");
    });

    it("サイドバーがlg:col-span-4を持つ", async () => {
      await renderPage({ category: "asset" });

      const sidebarWrapper = screen.getByTestId("sidebar-wrapper");
      expect(sidebarWrapper.className).toContain("lg:col-span-4");
    });
  });
});
