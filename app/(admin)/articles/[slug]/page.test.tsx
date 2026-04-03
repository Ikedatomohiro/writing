import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ArticleDetailPage from "./page";
import { getArticle, deleteArticle } from "@/lib/articles/storage";
import type { Article } from "@/lib/content/types";

vi.mock("@/lib/articles/storage", () => ({
  getArticle: vi.fn(),
  deleteArticle: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ slug: "test-slug" }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mockGetArticle = vi.mocked(getArticle);
const mockDeleteArticle = vi.mocked(deleteArticle);

const mockArticle: Article = {
  slug: "test-slug",
  title: "テスト記事",
  description: "テスト説明です。",
  content: "テスト本文です。",
  category: "tech",
  tags: ["test", "article"],
  published: true,
  date: "2024-01-01T00:00:00.000Z",
};

describe("ArticleDetailPage", () => {
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

    render(<ArticleDetailPage />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("記事が見つからない場合のメッセージを表示する", async () => {
    mockGetArticle.mockResolvedValue(null);

    render(<ArticleDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "記事が見つかりません" })
      ).toBeInTheDocument();
    });

    expect(screen.getByText("記事一覧に戻る")).toBeInTheDocument();
  });

  it("記事のタイトルを表示する", async () => {
    mockGetArticle.mockResolvedValue(mockArticle);

    render(<ArticleDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "テスト記事" })
      ).toBeInTheDocument();
    });
  });

  it("記事の本文を表示する", async () => {
    mockGetArticle.mockResolvedValue(mockArticle);

    render(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("テスト本文です。")).toBeInTheDocument();
    });
  });

  it("記事の公開状態を表示する", async () => {
    mockGetArticle.mockResolvedValue(mockArticle);

    render(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("公開")).toBeInTheDocument();
    });
  });

  it("記事のタグを表示する", async () => {
    mockGetArticle.mockResolvedValue(mockArticle);

    render(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("test")).toBeInTheDocument();
      expect(screen.getByText("article")).toBeInTheDocument();
    });
  });

  it("編集ボタンを表示する", async () => {
    mockGetArticle.mockResolvedValue(mockArticle);

    render(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("編集")).toBeInTheDocument();
    });
  });

  it("削除ボタンを表示する", async () => {
    mockGetArticle.mockResolvedValue(mockArticle);

    render(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("削除")).toBeInTheDocument();
    });
  });

  it("本文がない場合は「本文なし」を表示する", async () => {
    mockGetArticle.mockResolvedValue({ ...mockArticle, content: "" });

    render(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("本文なし")).toBeInTheDocument();
    });
  });

  it("タイトルがない場合は「無題」を表示する", async () => {
    mockGetArticle.mockResolvedValue({ ...mockArticle, title: "" });

    render(<ArticleDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "無題" })
      ).toBeInTheDocument();
    });
  });

  it("下書き状態を表示する", async () => {
    mockGetArticle.mockResolvedValue({
      ...mockArticle,
      published: false,
    });

    render(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("下書き")).toBeInTheDocument();
    });
  });

  it("日付を表示する", async () => {
    mockGetArticle.mockResolvedValue(mockArticle);

    render(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/日付:/)).toBeInTheDocument();
    });
  });

  it("タグがない場合はタグセクションを表示しない", async () => {
    mockGetArticle.mockResolvedValue({ ...mockArticle, tags: [] });

    render(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("テスト記事")).toBeInTheDocument();
    });

    expect(screen.queryByText("test")).not.toBeInTheDocument();
  });

  it("削除ボタンをクリックすると確認ダイアログが表示される", async () => {
    const user = userEvent.setup();
    mockGetArticle.mockResolvedValue(mockArticle);
    mockDeleteArticle.mockResolvedValue(true);

    const originalConfirm = window.confirm;
    window.confirm = vi.fn().mockReturnValue(false);

    render(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("削除")).toBeInTheDocument();
    });

    await user.click(screen.getByText("削除"));

    expect(window.confirm).toHaveBeenCalledWith("この記事を削除しますか？");

    window.confirm = originalConfirm;
  });

  it("削除を確認するとdeleteArticleが呼ばれる", async () => {
    const user = userEvent.setup();
    mockGetArticle.mockResolvedValue(mockArticle);
    mockDeleteArticle.mockResolvedValue(true);

    const originalConfirm = window.confirm;
    window.confirm = vi.fn().mockReturnValue(true);

    render(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("削除")).toBeInTheDocument();
    });

    await user.click(screen.getByText("削除"));

    await waitFor(() => {
      expect(mockDeleteArticle).toHaveBeenCalledWith("test-slug");
    });

    window.confirm = originalConfirm;
  });
});
