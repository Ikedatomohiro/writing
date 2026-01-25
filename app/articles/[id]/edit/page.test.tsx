import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChakra } from "@/app/test-utils";
import EditArticlePage from "./page";
import { getArticle, updateArticle } from "@/lib/articles/storage";
import type { Article } from "@/lib/articles/types";

vi.mock("@/lib/articles/storage", () => ({
  getArticle: vi.fn(),
  updateArticle: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "1" }),
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockGetArticle = vi.mocked(getArticle);
const mockUpdateArticle = vi.mocked(updateArticle);

const mockArticle: Article = {
  id: "1",
  title: "テスト記事",
  content: "テスト本文です。",
  keywords: ["test", "article"],
  status: "draft",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-02T00:00:00.000Z",
  publishedAt: null,
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
      () => new Promise(() => {}) // 解決しないPromise
    );

    renderWithChakra(<EditArticlePage />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("記事が見つからない場合のメッセージを表示する", async () => {
    mockGetArticle.mockResolvedValue(null);

    renderWithChakra(<EditArticlePage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "記事が見つかりません" })
      ).toBeInTheDocument();
    });

    expect(screen.getByText("記事一覧に戻る")).toBeInTheDocument();
  });

  it("記事のフォームを表示する", async () => {
    mockGetArticle.mockResolvedValue(mockArticle);

    renderWithChakra(<EditArticlePage />);

    await waitFor(() => {
      expect(screen.getByLabelText("タイトル")).toBeInTheDocument();
    });
  });

  it("記事のタイトルがフォームに入力されている", async () => {
    mockGetArticle.mockResolvedValue(mockArticle);

    renderWithChakra(<EditArticlePage />);

    await waitFor(() => {
      expect(screen.getByLabelText("タイトル")).toHaveValue("テスト記事");
    });
  });

  it("記事の本文がフォームに入力されている", async () => {
    mockGetArticle.mockResolvedValue(mockArticle);

    renderWithChakra(<EditArticlePage />);

    await waitFor(() => {
      expect(screen.getByLabelText("本文")).toHaveValue("テスト本文です。");
    });
  });

  it("キャンセルボタンをクリックすると記事詳細ページに戻る", async () => {
    const user = userEvent.setup();
    mockGetArticle.mockResolvedValue(mockArticle);

    renderWithChakra(<EditArticlePage />);

    await waitFor(() => {
      expect(screen.getByText("キャンセル")).toBeInTheDocument();
    });

    await user.click(screen.getByText("キャンセル"));

    expect(mockPush).toHaveBeenCalledWith("/articles/1");
  });

  it("保存ボタンをクリックするとupdateArticleが呼ばれる", async () => {
    const user = userEvent.setup();
    mockGetArticle.mockResolvedValue(mockArticle);
    mockUpdateArticle.mockResolvedValue(mockArticle);

    renderWithChakra(<EditArticlePage />);

    await waitFor(() => {
      expect(screen.getByLabelText("タイトル")).toBeInTheDocument();
    });

    // タイトルを変更
    const titleInput = screen.getByLabelText("タイトル");
    await user.clear(titleInput);
    await user.type(titleInput, "更新されたタイトル");

    // 更新ボタンをクリック
    await user.click(screen.getByRole("button", { name: "更新" }));

    await waitFor(() => {
      expect(mockUpdateArticle).toHaveBeenCalledWith("1", expect.objectContaining({
        title: "更新されたタイトル",
      }));
    });
  });

  it("保存後に記事詳細ページに遷移する", async () => {
    const user = userEvent.setup();
    mockGetArticle.mockResolvedValue(mockArticle);
    mockUpdateArticle.mockResolvedValue(mockArticle);

    renderWithChakra(<EditArticlePage />);

    await waitFor(() => {
      expect(screen.getByLabelText("タイトル")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "更新" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/articles/1");
    });
  });
});
