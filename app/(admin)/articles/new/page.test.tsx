import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewArticlePage from "./page";
import { createArticle } from "@/lib/articles/storage";
import type { Article } from "@/lib/content/types";

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
  slug: "new-slug",
  title: "新しい記事",
  description: "新しい説明",
  content: "新しい本文",
  category: "tech",
  tags: [],
  published: false,
  date: "2024-01-01T00:00:00.000Z",
};

describe("NewArticlePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("新規記事作成フォームを表示する", () => {
    render(<NewArticlePage />);

    expect(screen.getByPlaceholderText("記事のタイトルを入力")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("記事の本文を入力（MDX形式）")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("タグを入力してEnter")).toBeInTheDocument();
  });

  it("作成ボタンを表示する", () => {
    render(<NewArticlePage />);

    expect(screen.getByRole("button", { name: "作成" })).toBeInTheDocument();
  });

  it("キャンセルボタンを表示する", () => {
    render(<NewArticlePage />);

    expect(screen.getByRole("button", { name: "キャンセル" })).toBeInTheDocument();
  });

  it("キャンセルボタンをクリックすると記事一覧ページに戻る", async () => {
    const user = userEvent.setup();

    render(<NewArticlePage />);

    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(mockPush).toHaveBeenCalledWith("/articles");
  });

  it("フォームに入力して保存するとcreateArticleが呼ばれる", async () => {
    const user = userEvent.setup();
    mockCreateArticle.mockResolvedValue(mockCreatedArticle);

    render(<NewArticlePage />);

    await user.type(screen.getByPlaceholderText("記事のタイトルを入力"), "新しい記事");
    await user.type(screen.getByPlaceholderText("記事の概要を入力"), "新しい説明");
    await user.type(screen.getByPlaceholderText("記事の本文を入力（MDX形式）"), "新しい本文");

    await user.click(screen.getByRole("button", { name: "作成" }));

    await waitFor(() => {
      expect(mockCreateArticle).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "新しい記事",
          description: "新しい説明",
          content: "新しい本文",
        })
      );
    });
  });

  it("保存後に作成した記事の詳細ページに遷移する", async () => {
    const user = userEvent.setup();
    mockCreateArticle.mockResolvedValue(mockCreatedArticle);

    render(<NewArticlePage />);

    await user.type(screen.getByPlaceholderText("記事のタイトルを入力"), "新しい記事");
    await user.type(screen.getByPlaceholderText("記事の概要を入力"), "新しい説明");

    await user.click(screen.getByRole("button", { name: "作成" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/articles/new-slug");
    });
  });

  it("タイトルが空の状態でも作成ボタンはクリック可能", () => {
    render(<NewArticlePage />);

    const createButton = screen.getByRole("button", { name: "作成" });
    expect(createButton).not.toBeDisabled();
  });
});
