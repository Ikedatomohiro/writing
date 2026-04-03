import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ArticlesPage from "./page";
import { getArticles, deleteArticle } from "@/lib/articles/storage";
import type { Article } from "@/lib/content/types";

vi.mock("@/lib/articles/storage", () => ({
  getArticles: vi.fn(),
  deleteArticle: vi.fn(),
}));

const mockGetArticles = vi.mocked(getArticles);

const mockArticles: Article[] = [
  {
    slug: "typescript-intro",
    title: "TypeScript入門",
    description: "TypeScriptの基礎を学ぶ",
    content: "TypeScriptの基礎を学ぶ本文",
    category: "tech",
    tags: ["typescript", "programming"],
    published: true,
    date: "2024-01-01T00:00:00.000Z",
  },
  {
    slug: "react-guide",
    title: "React実践ガイド",
    description: "Reactでアプリを作る",
    content: "Reactでアプリを作る本文",
    category: "tech",
    tags: ["react", "frontend"],
    published: false,
    date: "2024-01-02T00:00:00.000Z",
  },
];

describe("ArticlesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetArticles.mockResolvedValue(mockArticles);
  });

  afterEach(() => {
    cleanup();
  });

  it("ページタイトルを表示する", async () => {
    render(<ArticlesPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "記事管理" })
      ).toBeInTheDocument();
    });
  });

  it("検索入力フィールドを表示する", async () => {
    render(<ArticlesPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("検索")).toBeInTheDocument();
    });
  });

  it("記事一覧を表示する", async () => {
    render(<ArticlesPage />);

    await waitFor(() => {
      expect(screen.getByText("TypeScript入門")).toBeInTheDocument();
      expect(screen.getByText("React実践ガイド")).toBeInTheDocument();
    });
  });

  it("クライアント側で検索フィルタリングする", async () => {
    const user = userEvent.setup();
    render(<ArticlesPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("検索")).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText("検索");
    await user.type(searchInput, "TypeScript");

    await waitFor(() => {
      expect(screen.getByText("TypeScript入門")).toBeInTheDocument();
      expect(screen.queryByText("React実践ガイド")).not.toBeInTheDocument();
    });
  });

  it("検索結果が0件の場合メッセージを表示する", async () => {
    const user = userEvent.setup();
    render(<ArticlesPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("検索")).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText("検索");
    await user.type(searchInput, "存在しない記事");

    await waitFor(() => {
      expect(
        screen.getByText("検索結果が見つかりませんでした")
      ).toBeInTheDocument();
    });
  });
});
