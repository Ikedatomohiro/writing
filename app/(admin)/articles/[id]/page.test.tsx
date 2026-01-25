import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChakra } from "@/app/test-utils";
import ArticleDetailPage from "./page";
import { getArticle, deleteArticle } from "@/lib/articles/storage";
import type { Article } from "@/lib/articles/types";

vi.mock("@/lib/articles/storage", () => ({
  getArticle: vi.fn(),
  deleteArticle: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "1" }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mockGetArticle = vi.mocked(getArticle);
const mockDeleteArticle = vi.mocked(deleteArticle);

const mockArticle: Article = {
  id: "1",
  title: "テスト記事",
  content: "テスト本文です。",
  keywords: ["test", "article"],
  status: "published",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-02T00:00:00.000Z",
  publishedAt: "2024-01-01T12:00:00.000Z",
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
      () => new Promise(() => {}) // 解決しないPromise
    );

    renderWithChakra(<ArticleDetailPage />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("記事が見つからない場合のメッセージを表示する", async () => {
    mockGetArticle.mockResolvedValue(null);

    renderWithChakra(<ArticleDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "記事が見つかりません" })
      ).toBeInTheDocument();
    });

    expect(screen.getByText("記事一覧に戻る")).toBeInTheDocument();
  });

  it("記事のタイトルを表示する", async () => {
    mockGetArticle.mockResolvedValue(mockArticle);

    renderWithChakra(<ArticleDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "テスト記事" })
      ).toBeInTheDocument();
    });
  });

  it("記事の本文を表示する", async () => {
    mockGetArticle.mockResolvedValue(mockArticle);

    renderWithChakra(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("テスト本文です。")).toBeInTheDocument();
    });
  });

  it("記事のステータスを表示する", async () => {
    mockGetArticle.mockResolvedValue(mockArticle);

    renderWithChakra(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("公開")).toBeInTheDocument();
    });
  });

  it("記事のキーワードを表示する", async () => {
    mockGetArticle.mockResolvedValue(mockArticle);

    renderWithChakra(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("test")).toBeInTheDocument();
      expect(screen.getByText("article")).toBeInTheDocument();
    });
  });

  it("編集ボタンを表示する", async () => {
    mockGetArticle.mockResolvedValue(mockArticle);

    renderWithChakra(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("編集")).toBeInTheDocument();
    });
  });

  it("削除ボタンを表示する", async () => {
    mockGetArticle.mockResolvedValue(mockArticle);

    renderWithChakra(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("削除")).toBeInTheDocument();
    });
  });

  it("本文がない場合は「本文なし」を表示する", async () => {
    const articleWithoutContent: Article = {
      ...mockArticle,
      content: "",
    };
    mockGetArticle.mockResolvedValue(articleWithoutContent);

    renderWithChakra(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("本文なし")).toBeInTheDocument();
    });
  });

  it("タイトルがない場合は「無題」を表示する", async () => {
    const articleWithoutTitle: Article = {
      ...mockArticle,
      title: "",
    };
    mockGetArticle.mockResolvedValue(articleWithoutTitle);

    renderWithChakra(<ArticleDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "無題" })
      ).toBeInTheDocument();
    });
  });

  it("下書きステータスを表示する", async () => {
    const draftArticle: Article = {
      ...mockArticle,
      status: "draft",
    };
    mockGetArticle.mockResolvedValue(draftArticle);

    renderWithChakra(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("下書き")).toBeInTheDocument();
    });
  });

  it("アーカイブステータスを表示する", async () => {
    const archivedArticle: Article = {
      ...mockArticle,
      status: "archived",
    };
    mockGetArticle.mockResolvedValue(archivedArticle);

    renderWithChakra(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("アーカイブ")).toBeInTheDocument();
    });
  });

  it("作成日時と更新日時を表示する", async () => {
    mockGetArticle.mockResolvedValue(mockArticle);

    renderWithChakra(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/作成:/)).toBeInTheDocument();
      expect(screen.getByText(/更新:/)).toBeInTheDocument();
    });
  });

  it("公開日時を表示する", async () => {
    mockGetArticle.mockResolvedValue(mockArticle);

    renderWithChakra(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/公開:/)).toBeInTheDocument();
    });
  });

  it("キーワードがない場合はキーワードセクションを表示しない", async () => {
    const articleWithoutKeywords: Article = {
      ...mockArticle,
      keywords: [],
    };
    mockGetArticle.mockResolvedValue(articleWithoutKeywords);

    renderWithChakra(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("テスト記事")).toBeInTheDocument();
    });

    expect(screen.queryByText("test")).not.toBeInTheDocument();
  });

  it("削除ボタンをクリックすると確認ダイアログが表示される", async () => {
    const user = userEvent.setup();
    mockGetArticle.mockResolvedValue(mockArticle);
    mockDeleteArticle.mockResolvedValue(undefined);

    const originalConfirm = window.confirm;
    window.confirm = vi.fn().mockReturnValue(false);

    renderWithChakra(<ArticleDetailPage />);

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
    mockDeleteArticle.mockResolvedValue(undefined);

    const originalConfirm = window.confirm;
    window.confirm = vi.fn().mockReturnValue(true);

    renderWithChakra(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("削除")).toBeInTheDocument();
    });

    await user.click(screen.getByText("削除"));

    await waitFor(() => {
      expect(mockDeleteArticle).toHaveBeenCalledWith("1");
    });

    window.confirm = originalConfirm;
  });
});
