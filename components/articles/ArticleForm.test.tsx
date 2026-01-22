import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, afterEach } from "vitest";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ArticleForm } from "./ArticleForm";
import type { Article } from "@/lib/articles/types";

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>
  );
}

function createTestArticle(overrides: Partial<Article> = {}): Article {
  return {
    id: "test-id",
    title: "テスト記事",
    content: "これはテスト記事の本文です。",
    keywords: ["React", "TypeScript"],
    status: "draft",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-15T12:30:00.000Z",
    publishedAt: null,
    ...overrides,
  };
}

describe("ArticleForm", () => {
  afterEach(() => {
    cleanup();
  });

  describe("新規作成モード", () => {
    it("「新規記事作成」見出しを表示する", () => {
      renderWithProviders(
        <ArticleForm onSubmit={vi.fn()} onCancel={vi.fn()} />
      );

      expect(screen.getByText("新規記事作成")).toBeInTheDocument();
    });

    it("「作成」ボタンを表示する", () => {
      renderWithProviders(
        <ArticleForm onSubmit={vi.fn()} onCancel={vi.fn()} />
      );

      expect(screen.getByRole("button", { name: "作成" })).toBeInTheDocument();
    });

    it("空のフォームフィールドを表示する", () => {
      renderWithProviders(
        <ArticleForm onSubmit={vi.fn()} onCancel={vi.fn()} />
      );

      const titleInput = screen.getByPlaceholderText("記事のタイトルを入力");
      const contentInput = screen.getByPlaceholderText("記事の本文を入力");

      expect(titleInput).toHaveValue("");
      expect(contentInput).toHaveValue("");
    });
  });

  describe("編集モード", () => {
    it("「記事を編集」見出しを表示する", () => {
      const article = createTestArticle();
      renderWithProviders(
        <ArticleForm article={article} onSubmit={vi.fn()} onCancel={vi.fn()} />
      );

      expect(screen.getByText("記事を編集")).toBeInTheDocument();
    });

    it("「更新」ボタンを表示する", () => {
      const article = createTestArticle();
      renderWithProviders(
        <ArticleForm article={article} onSubmit={vi.fn()} onCancel={vi.fn()} />
      );

      expect(screen.getByRole("button", { name: "更新" })).toBeInTheDocument();
    });

    it("既存の記事データをフォームに表示する", () => {
      const article = createTestArticle({
        title: "既存タイトル",
        content: "既存の本文",
        keywords: ["キーワード1"],
      });
      renderWithProviders(
        <ArticleForm article={article} onSubmit={vi.fn()} onCancel={vi.fn()} />
      );

      expect(screen.getByDisplayValue("既存タイトル")).toBeInTheDocument();
      expect(screen.getByDisplayValue("既存の本文")).toBeInTheDocument();
      expect(screen.getByText("キーワード1")).toBeInTheDocument();
    });
  });

  describe("フォーム操作", () => {
    it("タイトルを入力できる", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <ArticleForm onSubmit={vi.fn()} onCancel={vi.fn()} />
      );

      const titleInput = screen.getByPlaceholderText("記事のタイトルを入力");
      await user.type(titleInput, "新しいタイトル");

      expect(titleInput).toHaveValue("新しいタイトル");
    });

    it("本文を入力できる", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <ArticleForm onSubmit={vi.fn()} onCancel={vi.fn()} />
      );

      const contentInput = screen.getByPlaceholderText("記事の本文を入力");
      await user.type(contentInput, "新しい本文");

      expect(contentInput).toHaveValue("新しい本文");
    });

    it("キーワードを追加できる", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <ArticleForm onSubmit={vi.fn()} onCancel={vi.fn()} />
      );

      const keywordInput = screen.getByPlaceholderText(
        "キーワードを入力してEnter"
      );
      await user.type(keywordInput, "新しいキーワード");
      await user.click(screen.getByRole("button", { name: "追加" }));

      expect(screen.getByText("新しいキーワード")).toBeInTheDocument();
      expect(keywordInput).toHaveValue("");
    });

    it("Enterキーでキーワードを追加できる", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <ArticleForm onSubmit={vi.fn()} onCancel={vi.fn()} />
      );

      const keywordInput = screen.getByPlaceholderText(
        "キーワードを入力してEnter"
      );
      await user.type(keywordInput, "Enterキーワード{enter}");

      expect(screen.getByText("Enterキーワード")).toBeInTheDocument();
    });

    it("キーワードを削除できる", async () => {
      const user = userEvent.setup();
      const article = createTestArticle({ keywords: ["削除対象"] });
      renderWithProviders(
        <ArticleForm article={article} onSubmit={vi.fn()} onCancel={vi.fn()} />
      );

      expect(screen.getByText("削除対象")).toBeInTheDocument();

      const deleteButton = screen.getByLabelText("削除対象を削除");
      await user.click(deleteButton);

      expect(screen.queryByText("削除対象")).not.toBeInTheDocument();
    });

    it("重複したキーワードは追加されない", async () => {
      const user = userEvent.setup();
      const article = createTestArticle({ keywords: ["重複"] });
      renderWithProviders(
        <ArticleForm article={article} onSubmit={vi.fn()} onCancel={vi.fn()} />
      );

      const keywordInput = screen.getByPlaceholderText(
        "キーワードを入力してEnter"
      );
      await user.type(keywordInput, "重複");
      await user.click(screen.getByRole("button", { name: "追加" }));

      const keywords = screen.getAllByText("重複");
      expect(keywords).toHaveLength(1);
    });

    it("ステータスを変更できる", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      renderWithProviders(
        <ArticleForm onSubmit={onSubmit} onCancel={vi.fn()} />
      );

      const publishButton = screen.getByRole("button", { name: "公開" });
      await user.click(publishButton);
      await user.click(screen.getByRole("button", { name: "作成" }));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ status: "published" })
      );
    });
  });

  describe("フォーム送信", () => {
    it("送信時にonSubmitが正しいデータで呼ばれる", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      renderWithProviders(
        <ArticleForm onSubmit={onSubmit} onCancel={vi.fn()} />
      );

      await user.type(
        screen.getByPlaceholderText("記事のタイトルを入力"),
        "テストタイトル"
      );
      await user.type(
        screen.getByPlaceholderText("記事の本文を入力"),
        "テスト本文"
      );
      await user.type(
        screen.getByPlaceholderText("キーワードを入力してEnter"),
        "テストキーワード{enter}"
      );

      await user.click(screen.getByRole("button", { name: "作成" }));

      expect(onSubmit).toHaveBeenCalledWith({
        title: "テストタイトル",
        content: "テスト本文",
        keywords: ["テストキーワード"],
        status: "draft",
      });
    });

    it("キャンセルボタンでonCancelが呼ばれる", async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      renderWithProviders(
        <ArticleForm onSubmit={vi.fn()} onCancel={onCancel} />
      );

      await user.click(screen.getByRole("button", { name: "キャンセル" }));

      expect(onCancel).toHaveBeenCalled();
    });

    it("送信中はローディング状態になる", () => {
      const { container } = renderWithProviders(
        <ArticleForm
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
          isSubmitting={true}
        />
      );

      const submitButton = container.querySelector('button[type="submit"]');
      expect(submitButton).toHaveAttribute("data-loading");
      expect(submitButton).toBeDisabled();
    });
  });
});
