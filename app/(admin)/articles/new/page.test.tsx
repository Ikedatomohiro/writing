import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChakra } from "@/app/test-utils";
import NewArticlePage from "./page";
import { createArticle } from "@/lib/articles/storage";
import type { Article } from "@/lib/articles/types";

vi.mock("@/lib/articles/storage", () => ({
  createArticle: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockCreateArticle = vi.mocked(createArticle);

const mockCreatedArticle: Article = {
  id: "new-1",
  title: "新しい記事",
  content: "新しい本文",
  keywords: [],
  status: "draft",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  publishedAt: null,
};

describe("NewArticlePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("新規記事作成フォームを表示する", () => {
    renderWithChakra(<NewArticlePage />);

    expect(screen.getByLabelText("タイトル")).toBeInTheDocument();
    expect(screen.getByLabelText("本文")).toBeInTheDocument();
    expect(screen.getByLabelText("キーワード")).toBeInTheDocument();
  });

  it("作成ボタンを表示する", () => {
    renderWithChakra(<NewArticlePage />);

    expect(screen.getByRole("button", { name: "作成" })).toBeInTheDocument();
  });

  it("キャンセルボタンを表示する", () => {
    renderWithChakra(<NewArticlePage />);

    expect(screen.getByRole("button", { name: "キャンセル" })).toBeInTheDocument();
  });

  it("キャンセルボタンをクリックすると記事一覧ページに戻る", async () => {
    const user = userEvent.setup();

    renderWithChakra(<NewArticlePage />);

    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(mockPush).toHaveBeenCalledWith("/articles");
  });

  it("フォームに入力して保存するとcreateArticleが呼ばれる", async () => {
    const user = userEvent.setup();
    mockCreateArticle.mockResolvedValue(mockCreatedArticle);

    renderWithChakra(<NewArticlePage />);

    // タイトルを入力
    await user.type(screen.getByLabelText("タイトル"), "新しい記事");

    // 本文を入力
    await user.type(screen.getByLabelText("本文"), "新しい本文");

    // 作成ボタンをクリック
    await user.click(screen.getByRole("button", { name: "作成" }));

    await waitFor(() => {
      expect(mockCreateArticle).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "新しい記事",
          content: "新しい本文",
        })
      );
    });
  });

  it("保存後に作成した記事の詳細ページに遷移する", async () => {
    const user = userEvent.setup();
    mockCreateArticle.mockResolvedValue(mockCreatedArticle);

    renderWithChakra(<NewArticlePage />);

    // タイトルを入力
    await user.type(screen.getByLabelText("タイトル"), "新しい記事");

    // 作成ボタンをクリック
    await user.click(screen.getByRole("button", { name: "作成" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/articles/new-1");
    });
  });

  it("タイトルが空の状態でも作成ボタンはクリック可能", () => {
    renderWithChakra(<NewArticlePage />);

    const createButton = screen.getByRole("button", { name: "作成" });
    expect(createButton).not.toBeDisabled();
  });
});
