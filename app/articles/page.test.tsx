import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import ArticlesPage from "./page";
import { getArticles } from "@/lib/articles/storage";
import type { Article } from "@/lib/articles/types";

vi.mock("@/lib/articles/storage", () => ({
  getArticles: vi.fn(),
}));

const mockGetArticles = vi.mocked(getArticles);

const mockArticles: Article[] = [
  {
    id: "1",
    title: "TypeScript入門",
    content: "TypeScriptの基礎を学ぶ",
    keywords: ["typescript", "programming"],
    status: "published",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    publishedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    title: "React実践ガイド",
    content: "Reactでアプリを作る",
    keywords: ["react", "frontend"],
    status: "draft",
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
    publishedAt: null,
  },
];

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
};

describe("ArticlesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetArticles.mockResolvedValue(mockArticles);
  });

  afterEach(() => {
    cleanup();
  });

  it("ページタイトルを表示する", async () => {
    renderWithChakra(<ArticlesPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "記事一覧" })
      ).toBeInTheDocument();
    });
  });

  it("検索入力フィールドを表示する", async () => {
    renderWithChakra(<ArticlesPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("検索")).toBeInTheDocument();
    });
  });

  it("記事一覧を表示する", async () => {
    renderWithChakra(<ArticlesPage />);

    await waitFor(() => {
      expect(screen.getByText("TypeScript入門")).toBeInTheDocument();
      expect(screen.getByText("React実践ガイド")).toBeInTheDocument();
    });
  });

  it("検索クエリを入力するとgetArticlesが呼ばれる", async () => {
    renderWithChakra(<ArticlesPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("検索")).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText("検索");
    fireEvent.change(searchInput, { target: { value: "TypeScript" } });

    await waitFor(() => {
      expect(mockGetArticles).toHaveBeenCalledWith({
        searchQuery: "TypeScript",
      });
    });
  });

  it("検索結果が0件の場合メッセージを表示する", async () => {
    const user = userEvent.setup();
    mockGetArticles
      .mockResolvedValueOnce(mockArticles)
      .mockResolvedValue([]);

    renderWithChakra(<ArticlesPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("検索")).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText("検索");
    await user.type(searchInput, "存在しない");

    await waitFor(() => {
      expect(
        screen.getByText("検索結果が見つかりませんでした")
      ).toBeInTheDocument();
    });
  });
});
