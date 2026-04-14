import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  afterEach(() => {
    cleanup();
  });

  it("タイトルを表示する", () => {
    render(<EmptyState title="まだ投稿はありません" />);
    expect(screen.getByText("まだ投稿はありません")).toBeInTheDocument();
  });

  it("説明文を表示する", () => {
    render(<EmptyState title="まだ投稿はありません" description="最初の投稿を作成してみましょう" />);
    expect(screen.getByText("最初の投稿を作成してみましょう")).toBeInTheDocument();
  });

  it("CTAリンクを表示する", () => {
    render(
      <EmptyState
        title="まだ投稿はありません"
        ctaHref="/threads/new"
        ctaLabel="最初の投稿を作成"
      />
    );
    const link = screen.getByRole("link", { name: "最初の投稿を作成" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/threads/new");
  });

  it("CTAがない場合はリンクを表示しない", () => {
    render(<EmptyState title="まだ投稿はありません" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
