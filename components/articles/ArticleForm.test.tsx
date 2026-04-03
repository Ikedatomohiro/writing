import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, afterEach } from "vitest";
import { ArticleForm } from "./ArticleForm";
import type { Article } from "@/lib/content/types";

function createTestArticle(overrides: Partial<Article> = {}): Article {
  return {
    slug: "test-slug",
    title: "テスト記事",
    description: "テスト記事の説明です。",
    content: "これはテスト記事の本文です。",
    category: "tech",
    tags: ["React", "TypeScript"],
    published: false,
    date: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("ArticleForm", () => {
  afterEach(() => {
    cleanup();
  });

  describe("新規作成モード", () => {
    it("「新規記事作成」見出しを表示する", () => {
      render(<ArticleForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

      expect(screen.getByText("新規記事作成")).toBeInTheDocument();
    });

    it("「作成」ボタンを表示する", () => {
      render(<ArticleForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

      expect(screen.getByRole("button", { name: "作成" })).toBeInTheDocument();
    });

    it("空のフォームフィールドを表示する", () => {
      render(<ArticleForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

      const titleInput = screen.getByPlaceholderText("記事のタイトルを入力");
      const descInput = screen.getByPlaceholderText("記事の概要を入力");
      const contentInput = screen.getByPlaceholderText(
        "記事の本文を入力（MDX形式）"
      );

      expect(titleInput).toHaveValue("");
      expect(descInput).toHaveValue("");
      expect(contentInput).toHaveValue("");
    });
  });

  describe("編集モード", () => {
    it("「記事を編集」見出しを表示する", () => {
      const article = createTestArticle();
      render(
        <ArticleForm article={article} onSubmit={vi.fn()} onCancel={vi.fn()} />
      );

      expect(screen.getByText("記事を編集")).toBeInTheDocument();
    });

    it("「更新」ボタンを表示する", () => {
      const article = createTestArticle();
      render(
        <ArticleForm article={article} onSubmit={vi.fn()} onCancel={vi.fn()} />
      );

      expect(screen.getByRole("button", { name: "更新" })).toBeInTheDocument();
    });

    it("既存の記事データをフォームに表示する", () => {
      const article = createTestArticle({
        title: "既存タイトル",
        description: "既存の説明",
        content: "既存の本文",
        tags: ["タグ1"],
      });
      render(
        <ArticleForm article={article} onSubmit={vi.fn()} onCancel={vi.fn()} />
      );

      expect(screen.getByDisplayValue("既存タイトル")).toBeInTheDocument();
      expect(screen.getByDisplayValue("既存の説明")).toBeInTheDocument();
      expect(screen.getByDisplayValue("既存の本文")).toBeInTheDocument();
      expect(screen.getByText("タグ1")).toBeInTheDocument();
    });
  });

  describe("フォーム操作", () => {
    it("タイトルを入力できる", async () => {
      const user = userEvent.setup();
      render(<ArticleForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

      const titleInput = screen.getByPlaceholderText("記事のタイトルを入力");
      await user.type(titleInput, "新しいタイトル");

      expect(titleInput).toHaveValue("新しいタイトル");
    });

    it("本文を入力できる", async () => {
      const user = userEvent.setup();
      render(<ArticleForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

      const contentInput = screen.getByPlaceholderText(
        "記事の本文を入力（MDX形式）"
      );
      await user.type(contentInput, "新しい本文");

      expect(contentInput).toHaveValue("新しい本文");
    });

    it("タグを追加できる", async () => {
      const user = userEvent.setup();
      render(<ArticleForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

      const tagInput = screen.getByPlaceholderText("タグを入力してEnter");
      await user.type(tagInput, "新しいタグ");
      await user.click(screen.getByRole("button", { name: "追加" }));

      expect(screen.getByText("新しいタグ")).toBeInTheDocument();
      expect(tagInput).toHaveValue("");
    });

    it("Enterキーでタグを追加できる", async () => {
      const user = userEvent.setup();
      render(<ArticleForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

      const tagInput = screen.getByPlaceholderText("タグを入力してEnter");
      await user.type(tagInput, "Enterタグ{enter}");

      expect(screen.getByText("Enterタグ")).toBeInTheDocument();
    });

    it("タグを削除できる", async () => {
      const user = userEvent.setup();
      const article = createTestArticle({ tags: ["削除対象"] });
      render(
        <ArticleForm article={article} onSubmit={vi.fn()} onCancel={vi.fn()} />
      );

      expect(screen.getByText("削除対象")).toBeInTheDocument();

      const deleteButton = screen.getByLabelText("削除対象を削除");
      await user.click(deleteButton);

      expect(screen.queryByText("削除対象")).not.toBeInTheDocument();
    });

    it("重複したタグは追加されない", async () => {
      const user = userEvent.setup();
      const article = createTestArticle({ tags: ["重複"] });
      render(
        <ArticleForm article={article} onSubmit={vi.fn()} onCancel={vi.fn()} />
      );

      const tagInput = screen.getByPlaceholderText("タグを入力してEnter");
      await user.type(tagInput, "重複");
      await user.click(screen.getByRole("button", { name: "追加" }));

      const tags = screen.getAllByText("重複");
      expect(tags).toHaveLength(1);
    });

    it("公開状態を変更できる", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<ArticleForm onSubmit={onSubmit} onCancel={vi.fn()} />);

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });
  });

  describe("フォーム送信", () => {
    it("送信時にonSubmitが正しいデータで呼ばれる", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<ArticleForm onSubmit={onSubmit} onCancel={vi.fn()} />);

      await user.type(
        screen.getByPlaceholderText("記事のタイトルを入力"),
        "テストタイトル"
      );
      await user.type(
        screen.getByPlaceholderText("記事の概要を入力"),
        "テスト説明"
      );
      await user.type(
        screen.getByPlaceholderText("記事の本文を入力（MDX形式）"),
        "テスト本文"
      );
      await user.type(
        screen.getByPlaceholderText("タグを入力してEnter"),
        "テストタグ{enter}"
      );

      await user.click(screen.getByRole("button", { name: "作成" }));

      expect(onSubmit).toHaveBeenCalledWith({
        title: "テストタイトル",
        description: "テスト説明",
        content: "テスト本文",
        category: "tech",
        tags: ["テストタグ"],
        thumbnail: undefined,
        published: false,
      });
    });

    it("キャンセルボタンでonCancelが呼ばれる", async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      render(<ArticleForm onSubmit={vi.fn()} onCancel={onCancel} />);

      await user.click(screen.getByRole("button", { name: "キャンセル" }));

      expect(onCancel).toHaveBeenCalled();
    });

    it("送信中はローディング状態になる", () => {
      const { container } = render(
        <ArticleForm
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
          isSubmitting={true}
        />
      );

      const submitButton = container.querySelector('button[type="submit"]');
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent("保存中...");
    });
  });
});
