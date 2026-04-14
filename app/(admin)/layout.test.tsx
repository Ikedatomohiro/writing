import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach } from "vitest";
import AdminLayout from "./layout";

vi.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="session-provider">{children}</div>
  ),
}));

describe("AdminLayout", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("renders children within SessionProvider", () => {
    render(
      <AdminLayout>
        <div data-testid="child-content">Test Content</div>
      </AdminLayout>
    );

    expect(screen.getByTestId("session-provider")).toBeInTheDocument();
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("wraps children with SessionProvider", () => {
    render(
      <AdminLayout>
        <span>Nested Content</span>
      </AdminLayout>
    );

    const sessionProvider = screen.getByTestId("session-provider");
    expect(sessionProvider).toContainHTML("Nested Content");
  });

  it("ハンバーガーボタンが表示される", () => {
    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    expect(screen.getByLabelText("サイドバーを開閉")).toBeInTheDocument();
  });

  it("ハンバーガーボタンをクリックするとモバイルオーバーレイとしてサイドバーが開く", async () => {
    const user = userEvent.setup();
    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    const sidebar = screen.getByTestId("admin-sidebar");
    // 初期状態: hidden sm:flex クラスを持つ（デスクトップでは sm:flex が有効）
    expect(sidebar).toHaveClass("hidden");

    await user.click(screen.getByLabelText("サイドバーを開閉"));

    // open=true: !flex クラスが追加されてモバイルでも表示
    expect(sidebar).toHaveClass("!flex");
  });

  it("サイドバーを開いた後、再度クリックで閉じる", async () => {
    const user = userEvent.setup();
    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    const toggleBtn = screen.getByLabelText("サイドバーを開閉");
    const sidebar = screen.getByTestId("admin-sidebar");

    // 開く
    await user.click(toggleBtn);
    expect(sidebar).toHaveClass("!flex");

    // 閉じる
    await user.click(toggleBtn);
    expect(sidebar).not.toHaveClass("!flex");
  });
});
