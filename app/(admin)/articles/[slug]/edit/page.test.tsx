import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditArticlePage from "./page";
import { getArticle, updateArticle } from "@/lib/articles/storage";
import type { Article } from "@/lib/content/types";

vi.mock("@/lib/articles/storage", () => ({
  getArticle: vi.fn(),
  updateArticle: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useParams: () => ({ slug: "test-slug" }),
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockGetArticle = vi.mocked(getArticle);
const mockUpdateArticle = vi.mocked(updateArticle);

const mockArticle: Article = {
  slug: "test-slug",
  title: "テスト記事",
  description: "テスト説明です。",
  content: "テスト本文です。",
  category: "tech",
  tags: ["test", "article"],
  published: false,
  date: "2024-01-01T00:00:00.000Z",
};

describe("EditArticlePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("読み込み中の状態を表示する", () => {
    mockGetArticle.mockImplementation(
      () => new Promise(() => {})
    );

    render(<EditArticlePage />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("記事が見つからない場合のメッセージを表示する", async () => {
    mockGetArticle.mockResolvedValue(null);

    render(<EditArticlePage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "記事が見つかりません" })
      ).toBeInTheDocument();
    });

    expect(screen.getByText("記事一覧に戻る")).toBeInTheDocument();
  });

  it("記事のフォームを表示する", async () => {
    mockGetArticle.mockResolvedValue(mockArticle);

    render(<EditArticlePage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("記事のタイトルを入力")).toBeInTheDocument();
    });
  });

  it("記事のタイトルがフォームに入力されている", async () => {
    mockGetArticle.mockResolvedValue(mockArticle);

    render(<EditArticlePage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("記事のタイトルを入力")).toHaveValue("テスト記事");
    });
  });

  it("記事の本文がフォームに入力されている", async () => {
    mockGetArticle.mockResolvedValue(mockArticle);

    render(<EditArticlePage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("記事の本文を入力（MDX形式）")).toHaveValue("テスト本文です。");
    });
  });

  it("キャンセルボタンをクリックすると記事詳細ページに戻る", async () => {
    const user = userEvent.setup();
    mockGetArticle.mockResolvedValue(mockArticle);

    render(<EditArticlePage />);

    await waitFor(() => {
      expect(screen.getByText("キャンセル")).toBeInTheDocument();
    });

    await user.click(screen.getByText("キャンセル"));

    expect(mockPush).toHaveBeenCalledWith("/articles/test-slug");
  });

  it("保存ボタンをクリックするとupdateArticleが呼ばれる", async () => {
    const user = userEvent.setup();
    mockGetArticle.mockResolvedValue(mockArticle);
    mockUpdateArticle.mockResolvedValue(mockArticle);

    render(<EditArticlePage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("記事のタイトルを入力")).toBeInTheDocument();
    });

    const titleInput = screen.getByPlaceholderText("記事のタイトルを入力");
    await user.clear(titleInput);
    await user.type(titleInput, "更新されたタイトル");

    await user.click(screen.getByRole("button", { name: "更新" }));

    await waitFor(() => {
      expect(mockUpdateArticle).toHaveBeenCalledWith("test-slug", expect.objectContaining({
        title: "更新されたタイトル",
      }));
    });
  });

  it("保存後に記事詳細ページに遷移する", async () => {
    const user = userEvent.setup();
    mockGetArticle.mockResolvedValue(mockArticle);
    mockUpdateArticle.mockResolvedValue(mockArticle);

    render(<EditArticlePage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("記事のタイトルを入力")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "更新" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/articles/test-slug");
    });
  });
});
